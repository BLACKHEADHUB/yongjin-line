'use client';

// 승강장(첫 화면). 면접관이 10~30초 안에 판단할 핵심 정보를 전부 여기에 둔다.
export default function Platform({ profile: p, projects, onBoard }) {
  const featured = projects.filter((x) => x.featured);
  const shown = featured.length ? featured : projects.slice(0, 2);
  return (
    <main className="platform">
      <section className="hero">
        <p className="hero-kicker">YONGJIN LINE · 승강장</p>
        <h1 className="hero-name">
          {p.name}
          {p.nameEn && <span className="hero-name-en">{p.nameEn}</span>}
        </h1>
        {p.tagline && <p className="hero-tagline">{p.tagline}</p>}
        <p className="hero-meta">
          {[p.dept, p.year].filter(Boolean).join(' ')}
          {p.role && <> · {p.role}</>}
        </p>

        {(p.interests?.length > 0 || p.status) && (
          <div className="hero-chips">
            {p.status && <span className="chip status">{p.status}</span>}
            {p.interests?.map((i) => (
              <span key={i} className="chip">
                {i}
              </span>
            ))}
          </div>
        )}

        <div className="hero-actions">
          {p.email && (
            <a className="btn" href={`mailto:${p.email}`}>
              ✉️ {p.email}
            </a>
          )}
          {p.github && (
            <a className="btn" href={p.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          )}
          {p.resumeUrl && (
            <a className="btn" href={p.resumeUrl} target="_blank" rel="noopener noreferrer">
              이력서 PDF
            </a>
          )}
        </div>
      </section>

      {shown.length > 0 && (
        <section className="projects" aria-label="대표 프로젝트">
          <h2 className="section-title">대표 프로젝트</h2>
          <div className="project-grid">
            {shown.map((pr) => (
              <article key={pr.slug} className="project-card">
                {pr.image && <img src={pr.image} alt={`${pr.name} 스크린샷`} loading="lazy" />}
                <h3>{pr.name}</h3>
                {pr.summary && <p>{pr.summary}</p>}
                {pr.stack?.length > 0 && (
                  <div className="badges">
                    {pr.stack.map((s) => (
                      <span key={s} className="badge">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                {pr.links?.length > 0 && (
                  <div className="exits">
                    {pr.links.map((l, i) => (
                      <a key={l.url} className="exit" href={l.url} target="_blank" rel="noopener noreferrer">
                        <span className="exit-no">{i + 1}</span>
                        {l.label}
                      </a>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="board">
        <p className="board-text">내가 어떤 길을 지나왔는지, 열차를 타고 직접 확인해 보세요.</p>
        <div className="board-actions">
          <button type="button" className="btn primary big" onClick={() => onBoard(false)}>
            🚇 열차 탑승하기
          </button>
          <button type="button" className="btn big" onClick={() => onBoard(true)}>
            ▶ 자동 탑승 (발표용)
          </button>
        </div>
      </section>
    </main>
  );
}
