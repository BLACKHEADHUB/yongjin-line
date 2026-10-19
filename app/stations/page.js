import { loadContent } from '@/lib/content.js';

// 역 페이지 예비 초안. 작동하는 기능 없이 역 9개를 위에서 아래로 한 줄씩 보여주는 정적 페이지다.
// 데모 흐름(첫 화면 → 개찰구)에서는 연결하지 않았고, 주소(/stations)로만 열린다.
export const revalidate = 60;
export const metadata = { title: '역 목록 (예비) | 최용진' };

export default async function Stations() {
  const { stations } = await loadContent();
  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '32px 16px' }}>
      <h1 style={{ fontSize: 24, margin: '0 0 4px' }}>용진선 역 목록</h1>
      <p style={{ color: '#64748b', margin: '0 0 24px' }}>예비 초안 페이지입니다.</p>
      <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {stations.map((s) => (
          <li key={s.id} style={{ borderLeft: '4px solid #94a3b8', padding: '0 0 24px 16px' }}>
            <a href={`/stations/${s.id}`}><strong>{s.no} {s.name}</strong></a>
            {s.status === 'construction' && <span style={{ color: '#b45309' }}> (공사 중)</span>}
            <div style={{ color: '#64748b', fontSize: 14 }}>{s.subtitle}</div>
            <a href={`/stations/${s.id}`} style={{ fontSize: 14 }}>상세 소개 ›</a>
          </li>
        ))}
      </ol>
    </main>
  );
}
