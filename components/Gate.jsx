'use client';
import { useEffect, useRef, useState } from 'react';
import { beep, chime, thunk } from './audio';

// 개찰구: 교통카드를 끌어서(또는 눌러서) 단말기에 찍으면 삑! 소리와 함께 문이 열리고 통과한다.
export default function Gate({ profile: p, sound, setSound, onEnter }) {
  const [phase, setPhase] = useState('idle'); // idle → tapped → open → leaving
  const [drag, setDrag] = useState({ x: 0, y: 0, on: false, near: false });
  const cardRef = useRef(null);
  const readerRef = useRef(null);
  const start = useRef(null);
  const moved = useRef(false);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));

  const center = (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };

  // 카드를 단말기 위치로 붙이고 → 삑 → 문 열림 → 통과 화면으로
  function tap() {
    if (phase !== 'idle') return;
    const c = center(cardRef.current);
    const r = center(readerRef.current);
    setDrag((d) => ({ x: d.x + (r.x - c.x), y: d.y + (r.y - c.y) + 30, on: false, near: true }));
    setPhase('tapped');
    if (sound) beep();
    navigator.vibrate?.(60);
    later(() => { setPhase('open'); if (sound) { thunk(); chime(); } }, 900);
    later(() => setPhase('leaving'), 2200);
    later(onEnter, 2900);
  }

  function down(e) {
    if (phase !== 'idle') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { px: e.clientX, py: e.clientY, x: drag.x, y: drag.y };
    moved.current = false;
    setDrag((d) => ({ ...d, on: true }));
  }

  function move(e) {
    if (!start.current) return;
    const dx = e.clientX - start.current.px;
    const dy = e.clientY - start.current.py;
    if (Math.abs(dx) + Math.abs(dy) > 6) moved.current = true;
    const x = start.current.x + dx;
    const y = start.current.y + dy;
    const c = center(cardRef.current);
    const r = center(readerRef.current);
    setDrag({ x, y, on: true, near: Math.hypot(c.x - r.x, c.y - r.y) < 120 });
  }

  function up() {
    if (!start.current) return;
    start.current = null;
    if (!moved.current || drag.near) tap();
    else setDrag({ x: 0, y: 0, on: false, near: false }); // 멀면 제자리로 튕겨 돌아간다
  }

  const opened = phase === 'open' || phase === 'leaving';
  const text = { idle: '카드를 위로 끌어 단말기에 대세요', tapped: '확인 중...', open: '통과하세요!', leaving: '통과하세요!' }[phase];
  const board = { idle: '교통카드를 태그해 주세요 · Tag your card', tapped: '확인 중 · Checking...', open: '승차 완료 · Have a nice trip', leaving: '승차 완료 · Have a nice trip' }[phase];

  return (
    <main className={`gate ${phase} ${drag.near && phase === 'idle' ? 'near' : ''}`}>
      <button type="button" className="gate-skip" onClick={onEnter}>건너뛰기 ▸</button>
      <button type="button" className="gate-sound" onClick={() => setSound(!sound)} aria-pressed={sound}>{sound ? '🔊' : '🔇'}</button>

      <div className="gate-ceiling">
        <div className="gate-sign">용진선 · Yongjin Line</div>
        <div className="gate-board"><span key={phase}>{board}</span></div>
      </div>

      <div className="gate-hall">
        <div className="gate-machine">
          <div className="gate-post">
            <i className={`lamp ${opened ? 'go' : ''}`} />
          </div>
          <div className="gate-lane">
            <div className={`gate-arrow ${opened ? 'go' : ''}`}>{opened ? '↓' : '✕'}</div>
            <div className="glass left" />
            <div className="glass right" />
            <div className="lane-glow" />
          </div>
          <div className="gate-post">
            <i className={`lamp ${opened ? 'go' : ''}`} />
            <div ref={readerRef} className={`gate-reader ${phase !== 'idle' ? 'ok' : ''}`}>
              <div className="gate-screen">
                {phase === 'idle' ? '카드를 대 주세요' : (
                  <>삑!<br /><small>승차 완료 · 잔액: 경력 0원</small></>
                )}
              </div>
              <div className="gate-pad"><span /></div>
            </div>
          </div>
        </div>
      </div>
      <div className="gate-floor" />

      <p className="gate-text">{text}</p>

      <div
        ref={cardRef}
        className={`tapcard ${phase !== 'idle' ? 'done' : ''} ${drag.on ? 'dragging' : ''}`}
        style={{
          transform: `translate(${drag.x}px, ${drag.y}px) ${drag.on ? 'rotate(-4deg) scale(1.06)' : phase !== 'idle' ? 'scale(.75)' : ''}`,
          transition: drag.on ? 'none' : 'transform .6s cubic-bezier(.34,1.56,.64,1), opacity .5s',
        }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        role="button"
        tabIndex={0}
        aria-label="교통카드 찍기"
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && tap()}
      >
        <div className="tc-top">
          <span><span className="chip" />용진선 교통카드</span>
          <span className="nfc" aria-hidden="true">)))</span>
        </div>
        <div className="tc-mid">
          <div className="tc-photo">{p.photo ? <img src={p.photo} alt="" draggable="false" /> : '(사진)'}</div>
          <div className="tc-info">
            <strong>{p.name}</strong>
            <span>{[p.school, p.dept].filter(Boolean).join(' ')}</span>
            <span className="tc-role">{p.role}</span>
          </div>
        </div>
        <div className="tc-bottom">
          <span>{p.tagline}</span>
        </div>
      </div>
      <div className="gate-flash" />
    </main>
  );
}
