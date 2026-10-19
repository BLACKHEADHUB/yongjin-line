import { notFound } from 'next/navigation';
import { loadContent } from '@/lib/content.js';

// 역 상세 소개 (예비 페이지). 내용은 나중에 채운다.
export const revalidate = 60;

export default async function StationDetail({ params }) {
  const { id } = await params;
  const { stations } = await loadContent();
  const s = stations.find((x) => x.id === id);
  if (!s) notFound(); // 없는 역이면 404
  return (
    <main>
      <h1>{s.no} {s.name}</h1>
      <p>{s.subtitle}</p>
      <h2>상세 소개</h2>
      <p>준비 중입니다.</p>
      <a href="/stations">역 목록으로</a>
    </main>
  );
}
