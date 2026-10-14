'use client';
import { useEffect, useState } from 'react';
import MapView from './MapView';
import ListView from './ListView';
import Guestbook from './Guestbook';
import Ending from './Ending';

export default function Ride({ data, guestbook, sound, setSound, autoplay, setAutoplay, onPlatform }) {
  const { profile: p, stations } = data;
  const [view, setView] = useState('map');
  const [led, setLed] = useState('용진선 열차에 탑승하셨습니다');
  const [showBook, setShowBook] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  // 좁은 화면에서는 목록이 기본이다 (노선도는 가로로 넓다)
  useEffect(() => {
    if (window.matchMedia('(max-width: 720px)').matches && autoplay !== 'run') setView('list');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="ride">
      <header className="topbar">
        <div className="who">
          <button type="button" className="who-name" onClick={onPlatform}>← 포트폴리오</button>
          <span className="who-role">{p.name} · 성장 노선도</span>
        </div>
        <nav className="top-actions" aria-label="바로가기">
          {p.email && <a className="top-btn" href={`mailto:${p.email}`}>이메일</a>}
          {p.github && <a className="top-btn" href={p.github} target="_blank" rel="noopener noreferrer">GitHub</a>}
          {p.resumeUrl && <a className="top-btn" href={p.resumeUrl} target="_blank" rel="noopener noreferrer">이력서</a>}
          {view === 'map' && (
            <button type="button" className="top-btn primary" onClick={() => setAutoplay(autoplay === 'run' ? 'idle' : 'run')}>
              {autoplay === 'run' ? '■ 중지' : '▶ 자동 재생'}
            </button>
          )}
          <button type="button" className="top-btn" onClick={() => { setAutoplay('idle'); setView(view === 'map' ? 'list' : 'map'); }}>
            {view === 'map' ? '목록 보기' : '노선도 보기'}
          </button>
          {guestbook && <button type="button" className="top-btn" onClick={() => setShowBook(true)}>방명록</button>}
          <button type="button" className="top-btn" aria-pressed={sound} onClick={() => setSound(!sound)}>{sound ? '🔊 소리 켬' : '🔇 소리 끔'}</button>
          <button type="button" className="top-btn" onClick={() => { setAutoplay('idle'); setShowEnd(true); }}>종착역</button>
        </nav>
      </header>

      <div className="stage">
        {view === 'map' ? (
          <MapView stations={stations} sound={sound} setLed={setLed} autoplay={autoplay} setAutoplay={setAutoplay} onFinish={() => setShowEnd(true)} />
        ) : (
          <ListView stations={stations} />
        )}
      </div>

      <footer className="led" aria-live="off"><span key={led}>{led}</span></footer>

      {showBook && <Guestbook onClose={() => setShowBook(false)} />}
      {showEnd && (
        <Ending
          profile={p}
          firstStation={stations[0]?.name || '시점'}
          sound={sound}
          onClose={() => setShowEnd(false)}
          onGuestbook={guestbook ? () => { setShowEnd(false); setShowBook(true); } : null}
        />
      )}
    </div>
  );
}
