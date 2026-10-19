'use client';

// 첫 화면: 스크롤 없이 한 화면에 들어가는 신분증. 같은 카드로 개찰구를 통과해 노선도에 탑승한다.
export default function Platform({ profile: p, projects, stations, onBoard }) {
  const shown = (projects.some((x) => x.featured) ? projects.filter((x) => x.featured) : projects).slice(0, 3);
  const open = stations.filter((s) => s.status !== 'construction');
  const about = (p.about || '').split('TODO')[0].trim();
  const org = [p.school, p.dept, p.year].filter(Boolean).join(' ');

  return (
    <main className="idpage">
      <article className="idcard" aria-label={`${p.name} 신분증`}>
        <header className="id-top">
          <span className="id-chip" aria-hidden="true" />
          <span className="id-title">용진선 교통카드 <small>학생 포트폴리오</small></span>
          <span className="id-no">No. Y-{String(open.length).padStart(2, '0')}</span>
        </header>

        <div className="id-body">
          <aside className="id-side">
            <div className="id-photo">
              {p.photo ? (
                <img src={p.photo} alt={`${p.name} 증명사진`} />
              ) : (
                <span className="id-photo-empty">(사진)</span>
              )}
            </div>
            <h1 className="id-name">{p.name}</h1>
            {p.nameEn && <p className="id-name-en">{p.nameEn}</p>}
            <dl className="id-facts">
              <dt>소속</dt><dd>{org}</dd>
              {p.role && (<><dt>관심 직무</dt><dd>{p.role}</dd></>)}
              {p.talents?.length > 0 && (<><dt>특기</dt><dd>{p.talents.join(' · ')}</dd></>)}
              {p.status && (<><dt>상태</dt><dd>{p.status}</dd></>)}
            </dl>
          </aside>

          <section className="id-main">
            {p.tagline && <p className="id-tagline">{p.tagline}</p>}
            {about && <p className="id-about">{about}</p>}

            {p.skills?.length > 0 && (
              <div className="id-block">
                <h2>기술 스택</h2>
                {p.skills.map((g) => (
                  <div key={g.group} className="id-skill">
                    <span className="id-skill-label">{g.group}</span>
                    <span className="id-skill-items">
                      {g.items.map((it) => (
                        <span key={it.name} className={`badge${it.level === '익숙함' ? ' strong' : ''}`} title={it.level || undefined}>{it.name}</span>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {shown.length > 0 && (
              <div className="id-block">
                <h2>프로젝트</h2>
                <ul className="id-projects">
                  {shown.map((pr) => (
                    <li key={pr.slug}>
                      {pr.tag && <em className="id-tag">{pr.tag}</em>}
                      <strong>{pr.name}</strong>
                      <span>{pr.stack?.slice(0, 4).join(' · ')}</span>
                      {pr.links?.map((l) => (
                        <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer">{l.label} ↗</a>
                      ))}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>

        <footer className="id-bottom">
          <div className="id-contact">
            {p.email && <a href={`mailto:${p.email}`}>✉️ {p.email}</a>}
            {p.github && <a href={p.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>}
            {p.resumeUrl && <a href={p.resumeUrl} target="_blank" rel="noopener noreferrer">이력서 PDF ↗</a>}
          </div>
          <div className="id-line" aria-label="성장 노선도">
            <ol>
              {open.map((s) => (
                <li key={s.id} className={s.line}><i />{s.name}</li>
              ))}
            </ol>
            <div className="id-board">
              <p>이 신분증으로 개찰구를 지나, 성장 과정을 노선도로 볼 수 있어요.</p>
              <div className="board-actions">
                <button type="button" className="btn primary" onClick={onBoard}>🚇 노선도 탑승</button>
                <a className="btn" href="/stations">역 목록 보기</a>
              </div>
            </div>
          </div>
        </footer>
      </article>
    </main>
  );
}
