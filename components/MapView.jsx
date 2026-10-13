'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { VIEWBOX, ROUTES, TRAIN_ROUTE, distanceAlongRoute, toPath } from '@/lib/layout.js';
import StationBody from './StationBody';
import { chime, speak, stopSpeech } from './audio';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const TRANSFER_STEPS = ['전과 지원서 제출 중...', '고민을 정리하는 중...', '학점 이수 요건 확인 중...', '전과 심사 결과 대기 중... (99%에서 한참 걸립니다)'];

/**
 * 노선도 화면. 열차는 SVG 경로(getPointAtLength)를 따라 requestAnimationFrame으로 움직인다.
 * 전과역을 지나가면 환승 연출이 끼어들고, 열차 색과 방면 표지가 바뀐다.
 */
export default function MapView({ stations, sound, setLed, autoplay, setAutoplay, onFinish }) {
  const withDist = useMemo(() => stations.map((s) => ({ ...s, dist: distanceAlongRoute(s.x, s.y) })), [stations]);
  const open = useMemo(() => withDist.filter((s) => s.status !== 'construction'), [withDist]);
  const construction = useMemo(() => withDist.filter((s) => s.status === 'construction'), [withDist]);
  const transferSt = withDist.find((s) => s.line === 'transfer');
  const lastOpen = open[open.length - 1];

  const routeRef = useRef(null);
  const trainRef = useRef(null);
  const mapRef = useRef(null);
  const S = useRef({ dist: 0, current: open[0]?.id, transferred: false, moving: false, alive: true, sound });
  const toastTimer = useRef(null);

  const [currentId, setCurrentId] = useState(open[0]?.id);
  const [panelId, setPanelId] = useState(null);
  const [coding, setCoding] = useState(false);
  const [toast, setToast] = useState('');
  const [shake, setShake] = useState(false);
  const [drawn, setDrawn] = useState(false);
  const [transfer, setTransfer] = useState({ show: false, pct: 0, msg: '' });

  useEffect(() => {
    S.current.sound = sound;
  }, [sound]);

  useEffect(() => {
    S.current.alive = true;
    return () => {
      S.current.alive = false;
      stopSpeech();
      clearTimeout(toastTimer.current);
    };
  }, []);

  const placeTrain = useCallback((dist) => {
    const p = routeRef.current.getPointAtLength(dist);
    trainRef.current.setAttribute('transform', `translate(${p.x},${p.y})`);
    S.current.dist = dist;
  }, []);

  // 처음 한 번: 열차를 시점에 놓고, 노선이 그려지는 효과(stroke-dasharray)를 시작한다.
  useEffect(() => {
    placeTrain(0);
    mapRef.current.querySelectorAll('.route.solid').forEach((p) => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = len;
      p.getBoundingClientRect(); // 한 번 그려서 transition이 걸리게 한다
      p.style.strokeDashoffset = 0;
    });
    setDrawn(true);
  }, [placeTrain]);

  const showToast = useCallback((text, ms = 2800) => {
    setToast(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), ms);
  }, []);

  const say = useCallback(
    (text) => {
      if (!text) return;
      setLed(text);
      if (S.current.sound) speak(text);
    },
    [setLed],
  );

  // from → to 거리만큼 열차를 움직인다. 지나가는 역은 전광판에 "무정차 통과"로 표시한다.
  const runTrain = useCallback(
    (to, { duration, silent = false } = {}) => {
      const from = S.current.dist;
      const span = Math.abs(to - from);
      if (span < 1) return Promise.resolve();
      const dur = duration || Math.min(3200, Math.max(700, span * 2.2));
      const passed = new Set();
      return new Promise((resolve) => {
        const start = performance.now();
        const frame = (now) => {
          if (!S.current.alive) return resolve();
          const t = Math.min(1, (now - start) / dur);
          const d = from + (to - from) * ease(t);
          placeTrain(d);
          if (!silent) {
            for (const s of open) {
              if (s.id === S.current.current || passed.has(s.id)) continue;
              const between = Math.min(from, to) < s.dist && s.dist < Math.max(from, to);
              const reached = to > from ? d >= s.dist : d <= s.dist;
              if (between && reached && Math.abs(s.dist - to) > 1) {
                passed.add(s.id);
                setLed(`무정차 통과: ${s.name}`);
              }
            }
          }
          if (t < 1) requestAnimationFrame(frame);
          else resolve();
        };
        requestAnimationFrame(frame);
      });
    },
    [open, placeTrain, setLed],
  );

  const transferSequence = useCallback(async () => {
    if (S.current.sound) chime();
    say('정보보호 방면으로 환승합니다. 잠시만 기다려 주십시오.');
    setShake(true);
    setTransfer({ show: true, pct: 0, msg: TRANSFER_STEPS[0] });
    const marks = [25, 55, 80, 99];
    for (let i = 0; i < marks.length; i++) {
      await sleep(i === 0 ? 300 : 600);
      setTransfer({ show: true, pct: marks[i], msg: TRANSFER_STEPS[i] });
    }
    await sleep(2600); // 99%에서 한참 멈춘다 (전과 심사를 기다리던 기분)
    setTransfer({ show: true, pct: 100, msg: '환승 완료! 정보보호 방면으로 갈아탔습니다.' });
    S.current.transferred = true;
    setCoding(true);
    setShake(false);
    await sleep(900);
    setTransfer({ show: false, pct: 100, msg: '' });
  }, [say]);

  // 목적지까지 간다. 전과역을 가로지르면 환승 연출을 끼워 넣는다.
  const travel = useCallback(
    async (s) => {
      const T = transferSt.dist;
      const toAfter = s.dist >= T - 1;
      if (toAfter && !S.current.transferred) {
        await runTrain(T);
        S.current.current = transferSt.id;
        setCurrentId(transferSt.id);
        await transferSequence();
      } else if (!toAfter && S.current.transferred) {
        await runTrain(T);
        S.current.transferred = false;
        setCoding(false);
        showToast('역환승은 원래 불가능하지만, 추억 여행은 허용합니다.');
      }
      await runTrain(s.dist);
      S.current.current = s.id;
      setCurrentId(s.id);
    },
    [runTrain, showToast, transferSequence, transferSt],
  );

  const arrive = useCallback(
    (s, withChime = true) => {
      if (withChime && S.current.sound) chime();
      say(s.announce);
      setPanelId(s.id);
    },
    [say],
  );

  const goTo = useCallback(
    async (id) => {
      const s = withDist.find((x) => x.id === id);
      if (!s || S.current.moving) return;
      S.current.moving = true;
      try {
        setPanelId(null);
        if (s.status === 'construction') {
          // 공사 구간: 들어가려다 튕겨 나온다
          await travel(lastOpen);
          setLed('공사 구간 진입 시도 중...');
          await runTrain(lastOpen.dist + 60, { duration: 700, silent: true });
          setShake(true);
          await sleep(250);
          setShake(false);
          await runTrain(lastOpen.dist, { duration: 500, silent: true });
          showToast('개통 예정입니다. 채용을 통해 개통을 앞당겨 주세요 🙏', 3600);
          say(`${s.name}은 미개통 역입니다. 채용을 통해 개통을 앞당겨 주세요.`);
          setPanelId(s.id);
          return;
        }
        if (s.id === S.current.current) {
          arrive(s, false);
          return;
        }
        await travel(s);
        arrive(s);
      } finally {
        S.current.moving = false;
      }
    },
    [arrive, lastOpen, runTrain, say, setLed, showToast, travel, withDist],
  );

  // 자동 탑승 효과가 렌더링마다 다시 시작되지 않도록 최신 함수는 ref로 들고 있는다.
  const goToRef = useRef(goTo);
  goToRef.current = goTo;
  const finishRef = useRef({ onFinish, setAutoplay });
  finishRef.current = { onFinish, setAutoplay };

  // 자동 탑승: 처음부터 끝까지 역을 하나씩 지나간다. 효과가 정리되면(중지 버튼) 멈춘다.
  useEffect(() => {
    if (autoplay !== 'run') return;
    let cancelled = false;
    (async () => {
      for (const s of open) {
        if (cancelled || !S.current.alive) return;
        while (S.current.moving && !cancelled) await sleep(200);
        await goToRef.current(s.id);
        await sleep(4500);
      }
      if (!cancelled) {
        finishRef.current.setAutoplay('idle');
        finishRef.current.onFinish?.();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [autoplay, open]);

  const step = useCallback(
    (dir) => {
      if (S.current.moving) return;
      const idx = open.findIndex((s) => s.id === S.current.current);
      const next = open[idx + dir];
      if (next) goTo(next.id);
      else if (dir > 0 && construction[0]) goTo(construction[0].id);
    },
    [construction, goTo, open],
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.target instanceof HTMLElement && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'Escape') setPanelId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step]);

  const panelSt = withDist.find((s) => s.id === panelId);
  const panelIdx = panelSt ? open.findIndex((s) => s.id === panelSt.id) : -1;
  const prev = panelSt ? (panelIdx > 0 ? open[panelIdx - 1] : panelSt.status === 'construction' ? lastOpen : null) : null;
  const next = panelSt ? (panelIdx >= 0 && panelIdx < open.length - 1 ? open[panelIdx + 1] : panelIdx === open.length - 1 ? construction[0] : null) : null;

  const labelPos = (s) => {
    switch (s.label) {
      case 'above': return { x: s.x, y: s.y - 36, a: 'middle' };
      case 'left': return { x: s.x - 22, y: s.y + 2, a: 'end' };
      case 'right': return { x: s.x + 22, y: s.y + 2, a: 'start' };
      case 'transfer': return { x: s.x, y: s.y + 56, a: 'middle' };
      default: return { x: s.x, y: s.y + 34, a: 'middle' };
    }
  };

  return (
    <div className={`mapview${panelSt ? ' has-panel' : ''}`}>
      <div className="direction-chip" aria-live="polite">
        {coding ? '현재 방면: 정보보호 ▶' : '현재 방면: 사진영상 ◀'}
      </div>
      <div className="map-wrap">
        <svg ref={mapRef} className={`map${shake ? ' shake' : ''}${drawn ? ' drawn' : ''}`} viewBox={VIEWBOX} role="img" aria-label="용진선 노선도">
          {ROUTES.map((r, i) => (
            <path key={i} d={toPath(r.points)} className={`route ${r.dashed ? 'dashed' : 'solid'} ${r.kind}`} />
          ))}

          {/* 방면 표지 */}
          <g className={`dir-sign${coding ? '' : ' on'}`} transform="translate(130,498)">
            <rect width="170" height="30" rx="6" />
            <text x="85" y="20" textAnchor="middle">◀ 사진영상 방면</text>
          </g>
          <g className={`dir-sign${coding ? ' on' : ''}`} transform="translate(715,380)">
            <rect width="170" height="30" rx="6" />
            <text x="85" y="20" textAnchor="middle">정보보호 방면 ▶</text>
          </g>
          <g transform="translate(1185,372)">
            <rect className="sign-board" width="190" height="36" rx="8" />
            <text className="sign-text" x="95" y="23" textAnchor="middle">🚧 2027 개통 예정</text>
          </g>

          {/* 범례 */}
          <g transform="translate(40,226)">
            <rect className="legend-box" width="250" height="110" rx="10" />
            <text className="legend-title" x="16" y="26">노선 안내 · 용진선</text>
            {[
              ['before', '사진영상 구간', false],
              ['after', '정보보호 구간', false],
              ['after', '미개통 구간', true],
            ].map(([kind, label, dashed], i) => (
              <g key={label} transform={`translate(16,${52 + i * 24})`}>
                <line x1="0" y1="0" x2="34" y2="0" className={`legend-line ${kind}${dashed ? ' dashed' : ''}`} />
                <text className="legend-label" x="46" y="5">{label}</text>
              </g>
            ))}
          </g>

          {withDist.map((s) => {
            const isTransfer = s.line === 'transfer';
            const lp = labelPos(s);
            const cls = ['station', isTransfer && 'transfer-st', s.status === 'construction' && 'construction', s.id === currentId && 'active'].filter(Boolean).join(' ');
            const stroke = s.line === 'before' ? 'var(--before)' : 'var(--after)';
            return (
              <g
                key={s.id}
                className={cls}
                tabIndex={0}
                role="button"
                aria-label={`${s.no} ${s.name}`}
                onClick={() => {
                  setAutoplay('idle');
                  goTo(s.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setAutoplay('idle');
                    goTo(s.id);
                  }
                }}
              >
                {isTransfer ? (
                  <>
                    <circle cx={s.x} cy={s.y} r="22" fill="#fff" stroke="#1d2128" strokeWidth="4" />
                    <path d={`M${s.x - 16},${s.y} A16,16 0 0 1 ${s.x + 16},${s.y} Z`} fill="var(--before)" />
                    <path d={`M${s.x - 16},${s.y} A16,16 0 0 0 ${s.x + 16},${s.y} Z`} fill="var(--after)" />
                    <circle cx={s.x} cy={s.y} r="7" fill="#fff" />
                  </>
                ) : (
                  <circle className="dot" cx={s.x} cy={s.y} r="10" stroke={stroke} />
                )}
                <text x={lp.x} y={lp.y} textAnchor={lp.a} className="name">{s.name}</text>
                <text x={lp.x} y={lp.y + 16} textAnchor={lp.a} className="en">{s.no}</text>
              </g>
            );
          })}

          <path ref={routeRef} className="train-route" d={toPath(TRAIN_ROUTE)} />
          <g ref={trainRef} className={`train${coding ? ' coding' : ''}`}>
            <rect x="-20" y="-12" width="40" height="24" rx="8" className="train-body" />
            <rect x="-14" y="-6" width="10" height="7" rx="2" className="train-window" />
            <rect x="4" y="-6" width="10" height="7" rx="2" className="train-window" />
          </g>
        </svg>
        <p className="map-help">역을 클릭하거나 키보드 ← → 로 이동하세요</p>
      </div>

      <aside className={`panel${panelSt ? ' open' : ''}`} aria-hidden={!panelSt}>
        {panelSt && (
          <>
            <button type="button" className="panel-close" onClick={() => setPanelId(null)} aria-label="닫기">×</button>
            <div className="signboard">
              <div className="sign-main">
                <span className="sign-line-badge" style={{ background: panelSt.line === 'before' ? 'var(--before)' : 'var(--after)' }}>
                  {panelSt.no} · {panelSt.line === 'transfer' ? '환승 · 용진선' : '용진선'}
                </span>
                <div className="sign-name">{panelSt.name}</div>
                <div className="sign-en">{panelSt.en}</div>
                {panelSt.subtitle && <div className="sign-sub">{panelSt.subtitle}</div>}
              </div>
              <div className="sign-nav" style={{ background: panelSt.line === 'before' ? 'var(--before)' : 'var(--after)' }}>
                <button type="button" disabled={!prev} onClick={() => prev && goTo(prev.id)}>◀ {prev ? prev.name : '시점'}</button>
                <button type="button" disabled={!next} onClick={() => next && goTo(next.id)}>{next ? next.name : '종점'} ▶</button>
              </div>
            </div>
            <StationBody station={panelSt} />
          </>
        )}
      </aside>

      <div className={`transfer${transfer.show ? ' show' : ''}`} aria-hidden={!transfer.show}>
        <div className="transfer-box">
          <p className="transfer-title">환승 중...</p>
          <div className="bar"><div className="bar-fill" style={{ width: `${transfer.pct}%` }} /></div>
          <p className="transfer-msg">{transfer.msg}</p>
        </div>
      </div>
      <div className={`toast${toast ? ' show' : ''}`} role="status">{toast}</div>
    </div>
  );
}
