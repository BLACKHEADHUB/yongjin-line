import { notFound } from 'next/navigation';
import { loadContent } from '@/lib/content.js';
import StationBody from '@/components/StationBody';

// 역 상세 소개: 이야기, 프로젝트, 사진·영상은 data/portfolio.js의 해당 역에 적은 내용이 그대로 나온다.
export const revalidate = 60;

export default async function StationDetail({ params }) {
  const { id } = await params;
  const { stations, projects } = await loadContent();
  const s = stations.find((x) => x.id === id);
  if (!s) notFound(); // 없는 역이면 404
  return (
    <main className="page">
      <a href="/stations">← 역 목록</a>
      <div className="st-head">
        <span className="st-no">{s.no}</span>
        <div>
          <h1>{s.name}{s.status === 'construction' && ' (공사 중)'}</h1>
          <p className="muted">{s.subtitle}</p>
        </div>
      </div>
      <section className="panel"><StationBody station={s} projects={projects} /></section>
    </main>
  );
}
