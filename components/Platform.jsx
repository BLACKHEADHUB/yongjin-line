'use client';

const NAV = [
  ['about', '소개'],
  ['skills', '기술 스택'],
  ['projects', '프로젝트'],
  ['journey', '성장 과정'],
  ['contact', '연락처'],
];

// 첫 화면. 일반적인 포트폴리오처럼 소개, 기술 스택, 프로젝트, 연락처를 한 페이지에 둔다.
// 성장 과정(노선도)은 그중 한 섹션이며, 거기서 "노선도 보기"로 들어간다.
export default function Platform({ profile: p, projects, stations, onBoard }) {
  const featured = projects.filter((x) => x.featured);
  const shown = featured.length ? featured : projects;
  const open = stations.filter((s) => s.status !== 'construction');
  const todo = (t) => typeof t === 'string' && t.includes('TODO');
  const aboutText = (p.about || '').split('TODO')[0].trim() || p.about;

  return (
    <div className="site">
      <header className="site-nav">
        <a className="site-brand" href="#top">{p.name}</a>
        <nav aria-label="섹션">
          {NAV.map(([id, label]) => (
            <a key={id} href={`#${id}`}>{label}</a>
          ))}
        </nav>
      </header>

      <main className="site-main" id="top">
        <section className="hero">
          <p className="hero-kicker">{[p.dept, p.year].filter(Boolean).join(' ')}</p>
          <h1 className="hero-name">
            {p.name}
            {p.nameEn && <span className="hero-name-en">{p.nameEn}</span>}
          </h1>
          {p.tagline && <p className="hero-tagline">{p.tagline}</p>}
          {p.status && <p className="hero-status"><span className="chip status">{p.status}</span></p>}
          <div className="hero-actions">
            <a className="btn primary" href="#projects">프로젝트 보기</a>
            {p.resumeUrl && <a className="btn" href={p.resumeUrl} target="_blank" rel="noopener noreferrer">이력서 PDF</a>}
            {p.github && <a className="btn" href={p.github} target="_blank" rel="noopener noreferrer">GitHub</a>}
          </div>
        </section>

        <section id="about" className="block">
          <h2 className="section-title">소개</h2>
          <div className="about-grid">
            <p className="about-text">{todo(p.about) ? aboutText : p.about}</p>
            <dl className="facts">
              {p.dept && (<><dt>전공</dt><dd>{[p.dept, p.year].filter(Boolean).join(' ')}</dd></>)}
              {p.role && (<><dt>관심 직무</dt><dd>{p.role}</dd></>)}
              {p.interests?.length > 0 && (<><dt>관심 분야</dt><dd>{p.interests.join(', ')}</dd></>)}
            </dl>
          </div>
        </section>

        {p.skills?.length > 0 && (
          <section id="skills" className="block">
            <h2 className="section-title">기술 스택</h2>
            <div className="skill-grid">
              {p.skills.map((g) => (
                <div key={g.group} className="skill-card">
                  <h3>{g.group}</h3>
                  <ul>
                    {g.items.map((it) => (
                      <li key={it.name}>
                        <span>{it.name}</span>
                        {it.level && <em className={it.level === '익숙함' ? 'lv strong' : 'lv'}>{it.level}</em>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {shown.length > 0 && (
          <section id="projects" className="block">
            <h2 className="section-title">프로젝트</h2>
            <div className="project-grid">
              {shown.map((pr) => (
                <article key={pr.slug} className="project-card">
                  {pr.image && <img src={pr.image} alt={`${pr.name} 스크린샷`} loading="lazy" />}
                  <h3>{pr.name}</h3>
                  {pr.summary && <p>{pr.summary}</p>}
                  {pr.stack?.length > 0 && (
                    <div className="badges">
                      {pr.stack.map((s) => (
                        <span key={s} className="badge">{s}</span>
                      ))}
                    </div>
                  )}
                  {pr.links?.length > 0 && (
                    <div className="exits">
                      {pr.links.map((l) => (
                        <a key={l.url} className="exit" href={l.url} target="_blank" rel="noopener noreferrer">{l.label} ↗</a>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        <section id="journey" className="block journey">
          <h2 className="section-title">성장 과정</h2>
          <div className="journey-box">
            <div>
              <p className="journey-lead">고등학교부터 지금까지의 과정을 지하철 노선도 하나로 정리했습니다.</p>
              <p className="journey-text">
                각 역이 한 시기입니다. {open[0]?.name}에서 출발해 {open[open.length - 1]?.name}까지,
                무엇을 했고 무엇을 배웠는지 역마다 확인할 수 있습니다. 열차를 직접 움직이거나, 자동으로 재생하거나, 목록으로 볼 수 있습니다.
              </p>
              <div className="board-actions">
                <button type="button" className="btn primary big" onClick={() => onBoard(false)}>노선도로 보기</button>
                <button type="button" className="btn big" onClick={() => onBoard(true)}>자동 재생 (발표용)</button>
              </div>
            </div>
            <ol className="mini-line" aria-label="역 목록">
              {open.map((s) => (
                <li key={s.id} className={s.line}>{s.name}</li>
              ))}
            </ol>
          </div>
        </section>

        <section id="contact" className="block">
          <h2 className="section-title">연락처</h2>
          <div className="hero-actions">
            {p.email ? (
              <a className="btn" href={`mailto:${p.email}`}>✉️ {p.email}</a>
            ) : (
              <span className="muted">이메일은 곧 추가됩니다.</span>
            )}
            {p.github && <a className="btn" href={p.github} target="_blank" rel="noopener noreferrer">GitHub</a>}
            {p.resumeUrl && <a className="btn" href={p.resumeUrl} target="_blank" rel="noopener noreferrer">이력서 PDF</a>}
          </div>
        </section>
      </main>
      <footer className="site-foot">© {new Date().getFullYear()} {p.name}</footer>
    </div>
  );
}
