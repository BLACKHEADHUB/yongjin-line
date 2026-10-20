import { loadContent } from '@/lib/content.js';

// 역 목록. 역을 누르면 그 역의 상세 페이지로 간다.
export const revalidate = 60;
export const metadata = { title: '역 목록' };

export default async function Stations() {
  const { stations } = await loadContent();
  return (
    <main className="page">
      <h1>용진선 역 목록</h1>
      <ul className="station-list">
        {stations.map((s) => (
          <li key={s.id}>
            <a href={`/stations/${s.id}`}>
              <span className="st-no">{s.no}</span>
              <span><strong>{s.name}</strong>{s.status === 'construction' && ' (공사 중)'}<br /><small className="muted">{s.subtitle}</small></span>
            </a>
          </li>
        ))}
      </ul>
      <p><a href="/">← 처음으로</a></p>
    </main>
  );
}
