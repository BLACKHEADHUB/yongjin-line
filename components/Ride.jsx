'use client';
import { useEffect, useState } from 'react';
import SubwayMap from './SubwayMap';
import StationBody from './StationBody';
import Guestbook from './Guestbook';
import Ending from './Ending';

const TRANSFER_STEPS = ['전과 지원서 제출 중...', '고민을 정리하는 중...', '학점 이수 요건 확인 중...', '전과 심사 결과 대기 중... (99%에서 한참 걸립니다)'];

// 노선도 화면: 전광판, 노선도, 역 버튼, 선택한 역의 상세 패널, 방명록과 종착역 화면.
export default function Ride({ data, guestbook, sound, setSound, onPlatform }) {
  const { profile: p, stations, projects } = data;
  const [selectedId, setSelectedId] = useState(null);
  const [autoplay, setAutoplay] = useState(false);
  const [showBook, setShowBook] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [step, setStep] = useState(-1); // 환승 연출 단계 (-1이면 꺼짐)

  const index = stations.findIndex((s) => s.id === selectedId);
  const station = stations[index];
  const go = (i) => { setAutoplay(false); setSelectedId(stations[i].id); };

  // 전과역에 도착하면 환승 연출 문구를 차례로 보여 준다
  useEffect(() => {
    if (station?.line !== 'transfer') { setStep(-1); return; }
    setStep(0);
    const timers = TRANSFER_STEPS.map((_, i) => setTimeout(() => setStep(i), i * 900));
    const off = setTimeout(() => setStep(-1), TRANSFER_STEPS.length * 900 + 600);
    return () => { timers.forEach(clearTimeout); clearTimeout(off); };
  }, [station?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="ride">
      <header className="topbar">
        <button type="button" className="sub" onClick={onPlatform}>← 처음으로</button>
        <strong>{p.name} · 성장 노선도</strong>
        <span className="topbar-right">
          <button type="button" onClick={() => setAutoplay(!autoplay)}>{autoplay ? '■ 중지' : '▶ 자동 재생'}</button>
          {guestbook && <button type="button" className="sub" onClick={() => setShowBook(true)}>방명록</button>}
          {p.resumeUrl && <a className="btn-link" href={p.resumeUrl} target="_blank" rel="noopener noreferrer">이력서</a>}
          <button type="button" className="sub" onClick={() => { setAutoplay(false); setShowEnd(true); }}>종착역</button>
          <button type="button" className="sub" onClick={() => setSound(!sound)} aria-label={sound ? '소리 끄기' : '소리 켜기'}>{sound ? '🔊' : '🔇'}</button>
        </span>
      </header>

      <div className="led-board" aria-live="polite">
        <span key={station ? station.id : 'none'}>
          {station ? (station.announce || `이번 역은 ${station.name}입니다.`) : '노선도의 역을 눌러 보세요. 열차가 달려갑니다.'}
          {station?.en ? ` · ${station.en}` : ''}
        </span>
      </div>

      {step >= 0 && (
        <div className="transfer-banner" role="status">
          <strong>환승 중</strong> {TRANSFER_STEPS[step]}
          <div className="bar"><i style={{ width: `${Math.min(99, ((step + 1) / TRANSFER_STEPS.length) * 99)}%` }} /></div>
        </div>
      )}

      <SubwayMap
        stations={stations}
        selectedId={selectedId}
        onSelect={setSelectedId}
        autoplay={autoplay}
        onAutoplayEnd={() => { setAutoplay(false); setShowEnd(true); }}
      />

      <div className="legend" aria-hidden="true">
        <span><i className="lg before" />전과 전</span>
        <span><i className="lg after" />전과 후</span>
        <span><i className="lg cons" />공사 구간</span>
        <span><i className="lg transfer" />환승역</span>
        <span><i className="lg train" />열차</span>
      </div>

      <nav className="chips" aria-label="역 바로가기">
        {stations.map((s, i) => (
          <button key={s.id} type="button" className={`chip-btn ${s.id === selectedId ? 'on' : ''}`} onClick={() => go(i)}>
            {s.no} {s.name}
          </button>
        ))}
      </nav>

      <section className="panel station-panel" aria-live="polite">
        {station ? (
          <>
            <div className="st-head">
              <span className="st-no">{station.no}</span>
              <div>
                <h2>{station.name}{station.status === 'construction' && ' (공사 중)'}</h2>
                <p className="muted">{station.subtitle}{station.period ? ` · ${station.period}` : ''}</p>
              </div>
              <a className="muted" href={`/stations/${station.id}`}>단독 페이지 ↗</a>
            </div>
            <StationBody station={station} projects={projects} profile={p} />
            <div className="st-nav">
              <button type="button" className="sub" disabled={index <= 0} onClick={() => go(index - 1)}>◀ {stations[index - 1]?.name || '이전 역'}</button>
              <button type="button" className="sub" disabled={index >= stations.length - 1} onClick={() => go(index + 1)}>{stations[index + 1]?.name || '다음 역'} ▶</button>
            </div>
          </>
        ) : (
          <p className="muted">노선도의 역을 누르면 열차가 달려가고, 그 역의 이야기와 프로젝트, 사진, 영상이 여기에 나와요.</p>
        )}
      </section>

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
    </main>
  );
}
