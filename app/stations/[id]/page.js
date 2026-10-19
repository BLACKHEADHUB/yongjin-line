import { notFound } from 'next/navigation';
import { loadContent } from '@/lib/content.js';

// 역 상세 소개 예비 초안. 내용은 아직 비워 두고 자리만 만들어 둔 페이지다.
export const revalidate = 60;

export default async function StationDetail({ params }) {
  const { id } = await params;
  const { stations } = await loadContent();
  const s = stations.find((x) => x.id === id);
  if (!s) notFound(); // 없는 역 주소는 404
  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '32px 16px' }}>
      <a href="/stations" style={{ color: '#64748b', fontSize: 14 }}>← 역 목록</a>
      <h1 style={{ fontSize: 24, margin: '16px 0 4px' }}>{s.no} {s.name}</h1>
      <p style={{ color: '#64748b', margin: '0 0 24px' }}>{s.subtitle}</p>
      <h2 style={{ fontSize: 18 }}>상세 소개</h2>
      <p style={{ color: '#94a3b8' }}>(준비 중입니다)</p>
    </main>
  );
}
