'use client';

// 첫 화면: 소개, 기술, 프로젝트, 연락처를 한 페이지에 순서대로 보여준다.
export default function Platform({ profile: p, projects, onBoard }) {
  const about = (p.about || '').split('TODO')[0].trim();

  return (
    <main>
      <h1>{p.name}</h1>
      <p>{[p.school, p.dept].filter(Boolean).join(' ')}</p>
      <p>관심 직무: {p.role}</p>
      {p.talents?.length > 0 && <p>특기: {p.talents.join(', ')}</p>}
      {about && <p>{about}</p>}

      <h2>기술 스택</h2>
      <ul>
        {p.skills.map((g) => (
          <li key={g.group}>
            {g.group}: {g.items.map((it) => it.name).join(', ')}
          </li>
        ))}
      </ul>

      <h2>프로젝트</h2>
      <ul>
        {projects.map((pr) => (
          <li key={pr.slug}>
            {pr.name} - {pr.summary}{' '}
            {pr.links?.map((l) => (
              <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer">[{l.label}] </a>
            ))}
          </li>
        ))}
      </ul>

      <h2>연락처</h2>
      <p>
        {p.email && <a href={`mailto:${p.email}`}>{p.email}</a>}{' '}
        {p.github && <a href={p.github} target="_blank" rel="noopener noreferrer">GitHub</a>}
      </p>

      <p>
        <button type="button" onClick={onBoard}>노선도 탑승</button>{' '}
        <a href="/stations">역 목록</a>
      </p>
    </main>
  );
}
