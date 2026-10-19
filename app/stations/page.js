import { loadContent } from '@/lib/content.js';

// 역 목록 (예비 페이지). 역 이름만 한 줄씩 보여준다.
export const revalidate = 60;
export const metadata = { title: '역 목록' };

export default async function Stations() {
  const { stations } = await loadContent();
  return (
    <main>
      <h1>역 목록</h1>
      <ul>
        {stations.map((s) => (
          <li key={s.id}>
            <a href={`/stations/${s.id}`}>{s.no} {s.name}</a>
            {s.status === 'construction' && ' (공사 중)'}
          </li>
        ))}
      </ul>
      <a href="/">처음으로</a>
    </main>
  );
}
