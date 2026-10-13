import StationBody from './StationBody';

// 목록 보기: 노선도를 건너뛰고 역 전체를 한 화면에 훑는다.
export default function ListView({ stations }) {
  return (
    <div className="listview">
      <ol className="timeline">
        {stations.map((s) => (
          <li key={s.id} className={`tl-item ${s.line}${s.status === 'construction' ? ' construction' : ''}`}>
            <span className="tl-no">{s.no}</span>
            <div className="tl-card">
              <h2>
                {s.name}
                {s.line === 'transfer' && <span className="tl-tag">환승역</span>}
                {s.status === 'construction' && <span className="tl-tag mute">미개통</span>}
              </h2>
              {s.subtitle && <p className="tl-sub">{s.subtitle}</p>}
              <StationBody station={s} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
