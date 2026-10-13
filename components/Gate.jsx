'use client';
import { useState } from 'react';
import { beep } from './audio';

// 개찰구 인트로. 카드를 찍으면 통과하고, "건너뛰기"로 바로 들어갈 수도 있다.
export default function Gate({ name, sound, onEnter }) {
  const [phase, setPhase] = useState('idle'); // idle | tapped | open | leaving

  async function tap() {
    if (phase !== 'idle') return;
    if (sound) beep();
    setPhase('tapped');
    await new Promise((r) => setTimeout(r, 1500));
    setPhase('open');
    await new Promise((r) => setTimeout(r, 700));
    setPhase('leaving');
    await new Promise((r) => setTimeout(r, 500));
    onEnter();
  }

  return (
    <div className={`gate ${phase === 'open' || phase === 'leaving' ? 'open' : ''} ${phase === 'leaving' ? 'leaving' : ''}`}>
      <button type="button" className="gate-skip" onClick={onEnter}>
        건너뛰기 ▸
      </button>
      <div className="gate-inner">
        <p className="gate-hint">교통카드를 찍어 주세요</p>
        <div className="gate-machine">
          <div className={`reader ${phase !== 'idle' ? 'ok' : ''}`}>
            <div className="reader-screen">
              {phase === 'idle' ? (
                '카드를 대 주세요'
              ) : (
                <>
                  삑!
                  <br />
                  잔액: 경력 0원
                  <br />
                  <small>신규 노선 할인 적용</small>
                </>
              )}
            </div>
          </div>
          <button type="button" className={`card ${phase !== 'idle' ? 'tapped' : ''}`} onClick={tap} aria-label="교통카드 찍기">
            <span className="card-chip" />
            <span className="card-name">용진선 교통카드</span>
            <span className="card-owner">{name}</span>
          </button>
        </div>
        <div className="gate-flaps">
          <span className="flap left" />
          <span className="flap right" />
        </div>
        <p className="gate-sub">카드를 눌러 찍으세요</p>
      </div>
    </div>
  );
}
