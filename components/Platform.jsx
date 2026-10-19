'use client';

// 첫 화면: 교통카드 모양의 신분증 한 장에 소개, 기술, 프로젝트, 연락처를 담는다.
export default function Platform({ profile: p, projects, onBoard }) {
  const about = (p.about || '').split('TODO')[0].trim();

  return (
    <main>
      <div className="card">
        <div className="card-top">
          <span><span className="chip" />용진선 교통카드</span>
          <span>학생 포트폴리오</span>
        </div>
        <div className="card-body">
          <div className="photo">{p.photo ? <img src={p.photo} alt="증명사진" width="110" /> : '(사진)'}</div>
          <div className="info">
            <h1>{p.name}</h1>
            <div>{[p.school, p.dept].filter(Boolean).join(' ')}</div>
            <div>관심 직무: {p.role}</div>
            {p.talents?.length > 0 && <div>특기: {p.talents.join(', ')}</div>}
            {about && <p>{about}</p>}
          </div>
        </div>

        <div className="card-body" style={{ display: 'block', paddingTop: 0 }}>
          <h2>기술 스택</h2>
          {p.skills.map((g) => (
            <div key={g.group}>
              <strong>{g.group}</strong>{' '}
              {g.items.map((it) => <span key={it.name} className="badge">{it.name}</span>)}
            </div>
          ))}

          <h2>프로젝트</h2>
          <ul>
            {projects.map((pr) => (
              <li key={pr.slug}>
                <strong>{pr.name}</strong> - {pr.summary}{' '}
                {pr.links?.map((l) => (
                  <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer">[{l.label}] </a>
                ))}
              </li>
            ))}
          </ul>
        </div>

        <div className="card-bottom">
          {p.email && <a href={`mailto:${p.email}`}>{p.email}</a>}
          {p.github && <a href={p.github} target="_blank" rel="noopener noreferrer">GitHub</a>}
          <button type="button" onClick={onBoard}>🚇 노선도 탑승</button>
          <a href="/stations">역 목록</a>
        </div>
      </div>
    </main>
  );
}
