'use client';
import { useState } from 'react';

// 개찰구: 카드를 누르면 단말기로 올라가 찍히고(삑!), 문이 열린 뒤 다음 화면으로 넘어간다.
export default function Gate({ name, school, onEnter }) {
  const [phase, setPhase] = useState('idle'); // idle → tapped → open

  function tap() {
    if (phase !== 'idle') return;
    setPhase('tapped');
    setTimeout(() => setPhase('open'), 1200);
    setTimeout(onEnter, 2200);
  }

  return (
    <main className={`gate ${phase === 'open' ? 'open' : ''}`}>
      <h1>개찰구</h1>
      <p>{phase === 'idle' ? '아래 교통카드를 눌러 찍어 주세요.' : phase === 'tapped' ? '확인 중...' : '통과하세요!'}</p>
      <div className="machine">
        <div className={`reader ${phase === 'idle' ? '' : 'ok'}`}>
          <div className="reader-screen">{phase === 'idle' ? '카드를 대 주세요' : '삑! 승차 완료'}</div>
        </div>
        <button type="button" className={`tapcard ${phase === 'idle' ? '' : 'tapped'}`} onClick={tap}>
          <strong>용진선 교통카드</strong>
          <span>{[school, name].filter(Boolean).join(' ')}</span>
        </button>
        <div className="flaps"><div className="flap" /><div className="flap" /></div>
      </div>
    </main>
  );
}
