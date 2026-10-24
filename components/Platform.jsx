'use client';
import { useState } from 'react';

// 첫 화면: 가로형 교통카드(마우스를 따라 기울어짐) → 큰 탑승 버튼 → 소개, 기술, 프로젝트, 연락처.
export default function Platform({ profile: p, projects, stations, onBoard }) {
  const about = (p.about || '').split('TODO')[0].trim();
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, mx: 50, my: 50 });

  // 카드 위에서 포인터 위치에 따라 기울이고 빛(shine)을 움직인다
  function onMove(e) {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setTilt({ rx: (0.5 - py) * 12, ry: (px - 0.5) * 16, mx: px * 100, my: py * 100 });
  }

  return (
    <main className="platform">
      <div className="card-stage">
        <article
          className="idcard"
          style={{ transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`, '--mx': `${tilt.mx}%`, '--my': `${tilt.my}%` }}
          onPointerMove={onMove}
          onPointerLeave={() => setTilt({ rx: 0, ry: 0, mx: 50, my: 50 })}
        >
          <div className="idcard-top">
            <span><span className="chip" />용진선 교통카드</span>
            <span className="nfc" aria-hidden="true">)))</span>
          </div>
          <div className="idcard-mid">
            <div className="photo">{p.photo ? <img src={p.photo} alt="증명사진" /> : '(사진)'}</div>
            <div className="idcard-info">
              <h1>{p.name}</h1>
              <div>{[p.school, p.dept].filter(Boolean).join(' ')}</div>
              <div className="role">{p.role}</div>
              {p.talents?.length > 0 && <div className="talents">특기 · {p.talents.join(' · ')}</div>}
            </div>
          </div>
          <div className="idcard-bottom">
            <span>{p.tagline}</span>
            <span>STATIONS {stations.length}</span>
          </div>
          <div className="shine" />
        </article>
      </div>

      <button type="button" className="board" onClick={onBoard}>🚇 노선도 탑승하기</button>

      {about && <section className="panel"><h2>소개</h2><p>{about}</p></section>}

      <section className="panel">
        <h2>기술 스택</h2>
        <div className="skill-grid">
          {p.skills.map((g) => (
            <div key={g.group} className="skill-group">
              <strong>{g.group}</strong>
              <div>{g.items.map((it) => <span key={it.name} className="badge">{it.name}</span>)}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>프로젝트</h2>
        <div className="proj-list">
          {projects.map((pr) => (
            <div key={pr.slug} className="proj">
              {pr.image && <img className="proj-img" src={pr.image} alt={`${pr.name} 화면`} loading="lazy" />}
              {pr.tag && <span className="proj-tag">{pr.tag}</span>}
              <strong>{pr.name}</strong>
              <p>{pr.summary}</p>
              <div>{pr.stack?.map((t) => <span key={t} className="badge">{t}</span>)}</div>
              <div className="proj-links">
                {pr.links?.map((l) => (
                  <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer">{l.label} ↗</a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel contact">
        {p.email && <a href={`mailto:${p.email}`}>✉ {p.email}</a>}
        {p.github && <a href={p.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>}
        {p.resumeUrl && <a href={p.resumeUrl} target="_blank" rel="noopener noreferrer">이력서 PDF ↗</a>}
        <a href="/stations">역 목록</a>
      </section>
    </main>
  );
}
