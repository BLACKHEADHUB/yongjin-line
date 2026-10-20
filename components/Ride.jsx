'use client';
import { useState } from 'react';
import SubwayMap from './SubwayMap';
import StationBody from './StationBody';

// 노선도 화면: 위에 노선도, 아래에 역 버튼과 선택한 역의 상세 패널.
export default function Ride({ data, sound, setSound, onPlatform }) {
  const { profile: p, stations, projects } = data;
  const [selectedId, setSelectedId] = useState(null);
  const [autoplay, setAutoplay] = useState(false);
  const station = stations.find((s) => s.id === selectedId);

  return (
    <main className="ride">
      <header className="topbar">
        <button type="button" className="sub" onClick={onPlatform}>← 처음으로</button>
        <strong>{p.name} · 성장 노선도</strong>
        <span className="topbar-right">
          <button type="button" onClick={() => setAutoplay(!autoplay)}>{autoplay ? '■ 중지' : '▶ 자동 재생'}</button>
          <button type="button" className="sub" onClick={() => setSound(!sound)}>{sound ? '🔊' : '🔇'}</button>
        </span>
      </header>

      <div className="led-board" aria-live="polite">
        <span key={station ? station.id : 'none'}>
          {station ? (station.announce || `이번 역은 ${station.name}입니다.`) : '노선도의 역을 눌러 보세요. 열차가 달려갑니다.'}
          {station?.en ? ` · ${station.en}` : ''}
        </span>
      </div>

      <SubwayMap
        stations={stations}
        selectedId={selectedId}
        onSelect={setSelectedId}
        autoplay={autoplay}
        onAutoplayEnd={() => setAutoplay(false)}
      />

      <div className="legend" aria-hidden="true">
        <span><i className="lg before" />전과 전</span>
        <span><i className="lg after" />전과 후</span>
        <span><i className="lg cons" />공사 구간</span>
        <span><i className="lg transfer" />환승역</span>
        <span><i className="lg train" />열차</span>
      </div>

      <nav className="chips" aria-label="역 바로가기">
        {stations.map((s) => (
          <button key={s.id} type="button" className={`chip-btn ${s.id === selectedId ? 'on' : ''}`} onClick={() => { setAutoplay(false); setSelectedId(s.id); }}>
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
                <p className="muted">{station.subtitle}</p>
              </div>
              <a className="muted" href={`/stations/${station.id}`}>단독 페이지 ↗</a>
            </div>
            <StationBody station={station} projects={projects} />
          </>
        ) : (
          <p className="muted">노선도의 역을 누르면 열차가 달려가고, 그 역의 이야기와 프로젝트, 사진, 영상이 여기에 나와요.</p>
        )}
      </section>
    </main>
  );
}
