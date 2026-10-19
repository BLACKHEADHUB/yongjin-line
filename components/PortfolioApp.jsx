'use client';
import { useState } from 'react';
import Gate from './Gate';
import Platform from './Platform';

// 데모 버전 화면 흐름: 포트폴리오(첫 화면) → 개찰구(카드 찍기) → 준비 중 안내.
// 노선도·열차 화면은 _archive/ 폴더에 보관해 두었다.
export default function PortfolioApp({ data }) {
  const [stage, setStage] = useState('platform');

  if (stage === 'gate') {
    return <Gate name={data.profile.name} school={data.profile.school} sound={false} onEnter={() => setStage('soon')} />;
  }
  if (stage === 'soon') {
    return (
      <main className="idpage">
        <article className="idcard" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <h1 style={{ fontSize: 24, margin: '0 0 12px' }}>개찰구를 통과했습니다 🚇</h1>
          <p style={{ margin: '0 0 24px', color: '#64748b' }}>노선도 구간은 데모 버전에서는 아직 열리지 않았어요. 곧 개통됩니다.</p>
          <button type="button" className="btn primary" onClick={() => setStage('platform')}>첫 화면으로</button>
        </article>
      </main>
    );
  }
  return <Platform profile={data.profile} projects={data.projects} stations={data.stations} onBoard={() => setStage('gate')} />;
}
