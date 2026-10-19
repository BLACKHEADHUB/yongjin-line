'use client';

// 첫 화면: 가로형 교통카드(신분증) → 큰 탑승 버튼 → 기술 스택, 프로젝트, 연락처 순서.
export default function Platform({ profile: p, projects, onBoard }) {
  const about = (p.about || '').split('TODO')[0].trim();

  return (
    <main>
      <div className="idcard">
        <div className="idcard-top">
          <span><span className="chip" />용진선 교통카드</span>
          <span>학생 포트폴리오</span>
        </div>
        <div className="idcard-mid">
          <div className="photo">{p.photo ? <img src={p.photo} alt="증명사진" /> : '(사진)'}</div>
          <div className="idcard-info">
            <h1>{p.name}</h1>
            <div>{[p.school, p.dept].filter(Boolean).join(' ')}</div>
            <div>관심 직무: {p.role}</div>
            {p.talents?.length > 0 && <div>특기: {p.talents.join(' · ')}</div>}
          </div>
        </div>
        <div className="idcard-bottom">
          <span>{p.tagline}</span>
          <span>Y-01</span>
        </div>
      </div>

      <button type="button" className="board" onClick={onBoard}>🚇 노선도 탑승하기</button>

      {about && <div className="panel"><h2>소개</h2><p>{about}</p></div>}

      <div className="panel">
        <h2>기술 스택</h2>
        {p.skills.map((g) => (
          <div key={g.group}>
            <strong>{g.group}</strong>{' '}
            {g.items.map((it) => <span key={it.name} className="badge">{it.name}</span>)}
          </div>
        ))}
      </div>

      <div className="panel">
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

      <p className="links">
        {p.email && <a href={`mailto:${p.email}`}>{p.email}</a>}{' · '}
        {p.github && <a href={p.github} target="_blank" rel="noopener noreferrer">GitHub</a>}{' · '}
        <a href="/stations">역 목록</a>
      </p>
    </main>
  );
}
