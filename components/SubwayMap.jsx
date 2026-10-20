'use client';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { VIEWBOX, ROUTES, TRAIN_ROUTE, distanceAlongRoute, toPath } from '@/lib/layout.js';

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// 실제 지하철 노선도처럼: 굵은 노선, 흰 테두리 원 역, 역 번호와 이름, 환승 표시.
// 열차는 노선(SVG path)을 따라 움직이고, 역을 누르면 그 역까지 달려간다.
export default function SubwayMap({ stations, selectedId, onSelect, autoplay, onAutoplayEnd }) {
  const scrollRef = useRef(null);
  const routeRef = useRef(null);
  const trainRef = useRef(null);
  const live = useRef({ dist: 0, token: 0 });

  const withDist = useMemo(() => stations.map((s) => ({ ...s, dist: distanceAlongRoute(s.x, s.y) })), [stations]);
  const open = useMemo(() => withDist.filter((s) => s.status !== 'construction'), [withDist]);

  // 열차를 노선 위 dist 위치에 놓고 진행 방향으로 돌린다
  const place = useCallback((d) => {
    const path = routeRef.current;
    const p = path.getPointAtLength(d);
    const q = path.getPointAtLength(d + 1);
    const angle = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI;
    trainRef.current.setAttribute('transform', `translate(${p.x},${p.y}) rotate(${angle})`);
    live.current.dist = d;
    // 좁은 화면에서는 열차가 항상 가운데 보이도록 노선도를 가로로 스크롤한다
    const box = scrollRef.current;
    const svg = box.firstChild;
    box.scrollLeft = (p.x * svg.clientWidth) / 1400 - box.clientWidth / 2;
  }, []);

  const moveTo = useCallback((to) => {
    const from = live.current.dist;
    const token = ++live.current.token; // 새 이동이 시작되면 이전 이동은 멈춘다
    const dur = Math.min(2600, Math.max(600, Math.abs(to - from) * 2.2));
    const t0 = performance.now();
    const frame = (now) => {
      if (token !== live.current.token) return;
      const t = Math.min(1, (now - t0) / dur);
      place(from + (to - from) * ease(t));
      if (t < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [place]);

  useEffect(() => {
    place(open[0]?.dist || 0);
  }, [place]); // eslint-disable-line react-hooks/exhaustive-deps

  // 선택한 역이 바뀌면 열차가 그 역으로 간다 (공사 중인 역은 열차가 못 간다)
  useEffect(() => {
    const s = open.find((x) => x.id === selectedId);
    if (s) moveTo(s.dist);
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  // 자동 재생: 열린 역을 차례로 선택한다
  useEffect(() => {
    if (!autoplay) return;
    let stop = false;
    (async () => {
      for (const s of open) {
        if (stop) return;
        onSelect(s.id);
        await wait(3400);
      }
      if (!stop) onAutoplayEnd();
    })();
    return () => { stop = true; };
  }, [autoplay]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="map-scroll" ref={scrollRef}>
      <svg className="subway" viewBox={VIEWBOX} role="img" aria-label="용진선 노선도">
        <path ref={routeRef} d={toPath(TRAIN_ROUTE)} fill="none" stroke="none" />

        {ROUTES.map((r, i) => (
          <path key={i} d={toPath(r.points)} pathLength={r.dashed ? undefined : 1} className={`route ${r.kind}${r.dashed ? ' dashed' : ' solid'}`} />
        ))}

        {withDist.map((s) => {
          const cons = s.status === 'construction';
          const transfer = s.line === 'transfer';
          const above = s.label !== 'below';
          const ny = above ? s.y - 36 : s.y + 42;
          const cy = above ? ny - 32 : ny + 24;
          const sel = selectedId === s.id;
          return (
            <g
              key={s.id}
              className={`st ${cons ? 'cons' : ''} ${sel ? 'sel' : ''}`}
              role="button"
              tabIndex={0}
              aria-label={`${s.no} ${s.name}`}
              onClick={() => onSelect(s.id)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(s.id)}
            >
              <circle cx={s.x} cy={s.y} r="28" fill="transparent" />
              {sel && <circle className="pulse" cx={s.x} cy={s.y} r="14" />}
              {transfer && <circle className="ring" cx={s.x} cy={s.y} r="21" />}
              <circle className="dot" cx={s.x} cy={s.y} r={transfer ? 13 : 11} />
              <text className="nm" x={s.x} y={ny} textAnchor="middle">{s.name}</text>
              <text className="cd" x={s.x} y={cy} textAnchor="middle">{s.no}{cons ? ' · 공사중' : transfer ? ' · 환승' : ''}</text>
            </g>
          );
        })}

        <g ref={trainRef} className="train" pointerEvents="none">
          <rect x="-26" y="-11" width="52" height="22" rx="9" />
          <rect className="win" x="-17" y="-6" width="9" height="8" rx="2" />
          <rect className="win" x="-4" y="-6" width="9" height="8" rx="2" />
          <rect className="win" x="9" y="-6" width="9" height="8" rx="2" />
        </g>
      </svg>
    </div>
  );
}
