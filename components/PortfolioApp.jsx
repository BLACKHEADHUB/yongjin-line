'use client';
import { useState } from 'react';
import Gate from './Gate';
import Platform from './Platform';

// 화면 흐름: 첫 화면 → 개찰구 → 노선도(초안). 움직이는 노선도 코드는 _archive/ 폴더에 보관했다.
export default function PortfolioApp({ data }) {
  const [stage, setStage] = useState('platform');

  if (stage === 'gate') return <Gate name={data.profile.name} school={data.profile.school} onEnter={() => setStage('line')} />;
  if (stage === 'line') {
    return (
      <main>
        <h1>용진선 노선도</h1>
        <p>초안입니다. 아직 동작하지 않아요.</p>
        <ol className="line">
          {data.stations.map((s) => (
            <li key={s.id} className={s.status === 'construction' ? 'construction' : ''}>
              {s.name}
            </li>
          ))}
        </ol>
        <a href="/stations">역 목록</a>{' '}
        <button type="button" className="sub" onClick={() => setStage('platform')}>첫 화면으로</button>
      </main>
    );
  }
  return <Platform profile={data.profile} projects={data.projects} onBoard={() => setStage('gate')} />;
}
