'use client';
import { useCallback, useEffect, useState } from 'react';

// 탑승객 방명록. 글은 서버에서 다시 검증하고, 화면에는 React가 자동으로 이스케이프해서 보여 준다.
export default function Guestbook({ onClose }) {
  const [entries, setEntries] = useState([]);
  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // 봇을 걸러내는 숨김 입력칸
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/guestbook', { cache: 'no-store' });
      const data = await res.json();
      setAvailable(Boolean(data.available));
      setEntries(data.entries || []);
    } catch {
      setAvailable(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || '저장하지 못했습니다.');
      setMessage('');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="탑승객 방명록" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <button type="button" className="modal-close sub" onClick={onClose} aria-label="닫기">×</button>
        <h2>탑승객 방명록</h2>
        <p className="muted">한 줄 남기고 내려 주세요.</p>

        {available ? (
          <form onSubmit={submit} className="gb-form">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름 (20자 이내)" maxLength={20} required aria-label="이름" />
            <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="한 줄 메시지 (200자 이내)" maxLength={200} required aria-label="한 줄 메시지" />
            <input className="hp" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} aria-hidden="true" />
            <button type="submit" disabled={busy}>{busy ? '남기는 중...' : '남기기'}</button>
            {error && <p className="form-error" role="alert">{error}</p>}
          </form>
        ) : (
          !loading && <p className="muted">방명록을 지금은 사용할 수 없어요.</p>
        )}

        <ul className="gb-list">
          {loading && <li className="gb-empty">불러오는 중...</li>}
          {!loading && available && entries.length === 0 && <li className="gb-empty">아직 탑승객이 없습니다. 첫 번째가 되어 주세요.</li>}
          {entries.map((en) => (
            <li key={en.id}>
              <strong>{en.name}</strong>
              <span>{en.message}</span>
              <time dateTime={en.createdAt}>{new Date(en.createdAt).toLocaleDateString('ko-KR')}</time>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
