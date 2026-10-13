'use client';
import { useCallback, useEffect, useState } from 'react';

// 줄 단위 텍스트 <-> 데이터 변환 (입력창을 단순하게 유지하려고 한 줄에 한 항목씩 쓴다)
const lines = (t) => t.split('\n').map((s) => s.trim()).filter(Boolean);
const pairs = (t, sep) => lines(t).map((l) => { const i = l.indexOf(sep); return i < 0 ? [l, ''] : [l.slice(0, i).trim(), l.slice(i + 1).trim()]; });
const linksOut = (t) => pairs(t, '|').map(([label, url]) => ({ label, url }));
const linksIn = (a = []) => a.map((l) => `${l.label} | ${l.url}`).join('\n');
const mediaOut = (t) => lines(t).map((l) => { const [type = '', src = '', ...cap] = l.split('|').map((s) => s.trim()); return { type, src, caption: cap.join('|') }; });
const mediaIn = (a = []) => a.map((m) => `${m.type} | ${m.type === 'youtube' ? `https://youtu.be/${m.src}` : m.src} | ${m.caption || ''}`).join('\n');
const facOut = (t) => Object.fromEntries(pairs(t, ':'));
const facIn = (o = {}) => Object.entries(o).map(([k, v]) => `${k} : ${v}`).join('\n');
const csv = (t) => t.split(',').map((s) => s.trim()).filter(Boolean);

async function api(path, method = 'GET', body) {
  const res = await fetch(path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `요청에 실패했습니다 (${res.status})`);
  return data;
}

function Field({ label, children, hint }) {
  return (
    <label className="ad-field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

export default function AdminApp({ authed: initialAuthed, dbReady }) {
  const [authed, setAuthed] = useState(initialAuthed);
  const [password, setPassword] = useState('');
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('profile');
  const [msg, setMsg] = useState({ ok: true, text: '' });

  const notify = (ok, text) => setMsg({ ok, text });
  const load = useCallback(async () => {
    try {
      setData(await api('/api/admin/data'));
    } catch (e) {
      if (/401|로그인/.test(e.message)) setAuthed(false);
      notify(false, e.message);
    }
  }, []);

  useEffect(() => {
    if (authed) load();
  }, [authed, load]);

  async function login(e) {
    e.preventDefault();
    try {
      await api('/api/admin/login', 'POST', { password });
      setPassword('');
      setAuthed(true);
      notify(true, '');
    } catch (err) {
      notify(false, err.message);
    }
  }

  async function logout() {
    await api('/api/admin/logout', 'POST', {}).catch(() => {});
    setAuthed(false);
    setData(null);
  }

  if (!authed) {
    return (
      <main className="admin">
        <form className="ad-card ad-login" onSubmit={login}>
          <h1>관리자</h1>
          <Field label="비밀번호">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          </Field>
          <button className="btn primary" type="submit">로그인</button>
          {msg.text && <p className={msg.ok ? 'form-ok' : 'form-error'} role="alert">{msg.text}</p>}
          {!dbReady && <p className="ad-warn">MONGODB_URI가 설정되지 않았습니다. 로그인은 되지만 저장은 DB를 연결한 뒤에 가능합니다.</p>}
        </form>
      </main>
    );
  }

  return (
    <main className="admin">
      <div className="ad-head">
        <h1>용진선 관리자</h1>
        <div>
          <a className="btn" href="/">사이트 보기</a>{' '}
          <button className="btn" type="button" onClick={logout}>로그아웃</button>
        </div>
      </div>
      {data && !data.dbConfigured && <p className="ad-warn">DB가 연결되지 않아 지금은 저장할 수 없습니다. 화면에는 기본(시드) 내용이 보입니다.</p>}
      {data && data.dbConfigured && data.source === 'seed' && <p className="ad-warn">DB에 아직 내용이 없습니다. 아래에서 저장하면 기본 내용과 함께 DB에 만들어집니다 (또는 <code>npm run seed</code>).</p>}
      {msg.text && <p className={msg.ok ? 'form-ok' : 'form-error'} role="status">{msg.text}</p>}

      <div className="ad-tabs" role="tablist">
        {[['profile', '프로필'], ['stations', '역'], ['projects', '프로젝트'], ['guestbook', '방명록']].map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {!data ? <p>불러오는 중...</p> : (
        <>
          {tab === 'profile' && <ProfileForm initial={data.profile} notify={notify} reload={load} />}
          {tab === 'stations' && data.stations.map((s) => <StationForm key={s.id} s={s} notify={notify} reload={load} />)}
          {tab === 'projects' && <Projects list={data.projects} notify={notify} reload={load} />}
          {tab === 'guestbook' && (
            <ul className="ad-gb">
              {data.guestbook.length === 0 && <li>방명록이 비어 있습니다.</li>}
              {data.guestbook.map((g) => (
                <li key={g.id}>
                  <div><strong>{g.name}</strong> <span>{g.message}</span></div>
                  <button className="btn" type="button" onClick={async () => {
                    if (!confirm('이 글을 삭제할까요?')) return;
                    try { await api(`/api/admin/guestbook/${g.id}`, 'DELETE'); notify(true, '삭제했습니다.'); load(); } catch (e) { notify(false, e.message); }
                  }}>삭제</button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  );
}

function ProfileForm({ initial, notify, reload }) {
  const [f, setF] = useState({ ...initial, interests: (initial.interests || []).join(', ') });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function save(e) {
    e.preventDefault();
    try {
      await api('/api/admin/profile', 'PUT', { ...f, interests: csv(f.interests) });
      notify(true, '프로필을 저장했습니다.');
      reload();
    } catch (err) { notify(false, err.message); }
  }
  const text = (k, label, hint) => <Field label={label} hint={hint}><input value={f[k] || ''} onChange={set(k)} /></Field>;
  return (
    <form className="ad-card" onSubmit={save}>
      {text('name', '이름')}{text('nameEn', '영문 표기')}{text('dept', '학과')}{text('year', '학년')}
      {text('tagline', '한 줄 소개')}{text('role', '직무 방향')}
      {text('interests', '관심 분야', '쉼표로 구분')}
      {text('status', '현재 상태')}{text('email', '이메일')}{text('github', 'GitHub 주소')}
      {text('resumeUrl', '이력서 PDF 주소', '예: /resume.pdf (public 폴더에 파일을 두면 됩니다)')}
      {text('farewell', '마지막 한 마디')}
      <button className="btn primary" type="submit">저장</button>
    </form>
  );
}

function StationForm({ s, notify, reload }) {
  const [f, setF] = useState({
    name: s.name, en: s.en || '', subtitle: s.subtitle || '', announce: s.announce || '',
    story: (s.story || []).join('\n\n'), tags: (s.tags || []).join(', '),
    facilities: facIn(s.facilities), media: mediaIn(s.media), links: linksIn(s.links),
  });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function save(e) {
    e.preventDefault();
    try {
      await api(`/api/admin/stations/${s.id}`, 'PUT', {
        name: f.name, en: f.en, subtitle: f.subtitle, announce: f.announce,
        story: f.story.split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean),
        tags: csv(f.tags), facilities: facOut(f.facilities), media: mediaOut(f.media), links: linksOut(f.links),
      });
      notify(true, `${s.no} ${f.name} 저장했습니다.`);
      reload();
    } catch (err) { notify(false, err.message); }
  }
  return (
    <details className="ad-card">
      <summary>{s.no} · {s.name}</summary>
      <form onSubmit={save}>
        <Field label="역 이름"><input value={f.name} onChange={set('name')} /></Field>
        <Field label="영문 부제"><input value={f.en} onChange={set('en')} /></Field>
        <Field label="한 줄 농담 부제"><input value={f.subtitle} onChange={set('subtitle')} /></Field>
        <Field label="이야기" hint="문단 사이에 빈 줄"><textarea rows={8} value={f.story} onChange={set('story')} /></Field>
        <Field label="쓴 도구·기술" hint="쉼표로 구분"><input value={f.tags} onChange={set('tags')} /></Field>
        <Field label="역 시설 안내" hint="한 줄에 하나: 이름 : 내용"><textarea rows={3} value={f.facilities} onChange={set('facilities')} /></Field>
        <Field label="사진·영상" hint="한 줄에 하나: image | 주소 | 설명  /  video | 주소 | 설명  /  youtube | 유튜브주소 | 설명"><textarea rows={3} value={f.media} onChange={set('media')} /></Field>
        <Field label="출구(링크)" hint="한 줄에 하나: 이름 | 주소"><textarea rows={2} value={f.links} onChange={set('links')} /></Field>
        <Field label="안내방송 문구"><input value={f.announce} onChange={set('announce')} /></Field>
        <button className="btn primary" type="submit">저장</button>
      </form>
    </details>
  );
}

function Projects({ list, notify, reload }) {
  const blank = { slug: '', name: '', summary: '', stack: '', links: '', image: '', featured: false, order: 99 };
  return (
    <>
      {list.map((p) => <ProjectForm key={p.slug} p={p} notify={notify} reload={reload} />)}
      <ProjectForm p={blank} isNew notify={notify} reload={reload} />
    </>
  );
}

function ProjectForm({ p, isNew, notify, reload }) {
  const init = { ...p, stack: Array.isArray(p.stack) ? p.stack.join(', ') : p.stack, links: Array.isArray(p.links) ? linksIn(p.links) : p.links, image: p.image || '' };
  const [f, setF] = useState(init);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function save(e) {
    e.preventDefault();
    try {
      await api('/api/admin/projects', 'POST', { ...f, stack: csv(f.stack), links: linksOut(f.links), order: Number(f.order) });
      notify(true, '프로젝트를 저장했습니다.');
      if (isNew) setF(init);
      reload();
    } catch (err) { notify(false, err.message); }
  }
  async function del() {
    if (!confirm('이 프로젝트를 삭제할까요?')) return;
    try { await api(`/api/admin/projects/${p.slug}`, 'DELETE'); notify(true, '삭제했습니다.'); reload(); } catch (err) { notify(false, err.message); }
  }
  return (
    <details className="ad-card" open={isNew ? false : undefined}>
      <summary>{isNew ? '+ 새 프로젝트' : p.name}</summary>
      <form onSubmit={save}>
        <Field label="아이디" hint="영문 소문자, 숫자, - 만"><input value={f.slug} onChange={set('slug')} disabled={!isNew} /></Field>
        <Field label="이름"><input value={f.name} onChange={set('name')} /></Field>
        <Field label="한 줄 설명"><input value={f.summary} onChange={set('summary')} /></Field>
        <Field label="기술" hint="쉼표로 구분"><input value={f.stack} onChange={set('stack')} /></Field>
        <Field label="링크" hint="한 줄에 하나: 이름 | 주소"><textarea rows={2} value={f.links} onChange={set('links')} /></Field>
        <Field label="이미지 주소"><input value={f.image} onChange={set('image')} /></Field>
        <Field label="순서"><input type="number" value={f.order} onChange={set('order')} /></Field>
        <label className="ad-check"><input type="checkbox" checked={Boolean(f.featured)} onChange={(e) => setF({ ...f, featured: e.target.checked })} /> 첫 화면에 표시</label>
        <button className="btn primary" type="submit">저장</button>{' '}
        {!isNew && <button className="btn" type="button" onClick={del}>삭제</button>}
      </form>
    </details>
  );
}
