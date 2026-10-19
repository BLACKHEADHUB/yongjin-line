'use client';
import { useState } from 'react';
import Gate from './Gate';
import Platform from './Platform';

// 화면 흐름: 첫 화면 → 개찰구 → 준비 중 안내. 노선도 코드는 _archive/ 폴더에 보관했다.
export default function PortfolioApp({ data }) {
  const [stage, setStage] = useState('platform');

  if (stage === 'gate') return <Gate name={data.profile.name} onEnter={() => setStage('soon')} />;
  if (stage === 'soon') {
    return (
      <main>
        <h1>개찰구를 통과했습니다</h1>
        <p>노선도는 아직 준비 중입니다.</p>
        <a href="/stations">역 목록</a>{' '}
        <button type="button" onClick={() => setStage('platform')}>첫 화면으로</button>
      </main>
    );
  }
  return <Platform profile={data.profile} projects={data.projects} onBoard={() => setStage('gate')} />;
}
