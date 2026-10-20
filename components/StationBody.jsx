import { youtubeId } from '@/lib/validate.js';

// 역 하나의 내용: 이야기, 연결된 프로젝트, 사진·영상, 기술, 시설 안내, 링크.
// 지도 옆 패널과 /stations/[id] 페이지에서 같이 쓴다.
// 프로젝트는 station.projects에 slug를 적어 연결하고, 사진·영상은 station.media에 추가한다.
export default function StationBody({ station: s, projects = [] }) {
  const story = (s.story || []).filter((t) => !t.startsWith('TODO')); // 아직 안 쓴 칸은 화면에서 숨김
  const linked = (s.projects || []).map((slug) => projects.find((p) => p.slug === slug)).filter(Boolean);
  const facilities = Object.entries(s.facilities || {});

  return (
    <div className="station-body">
      {story.map((t, i) => <p key={i}>{t}</p>)}

      {linked.length > 0 && (
        <>
          <h3>이 역의 프로젝트</h3>
          <div className="proj-list">
            {linked.map((p) => (
              <div key={p.slug} className="proj">
                {p.tag && <span className="proj-tag">{p.tag}</span>}
                <strong>{p.name}</strong>
                <p>{p.summary}</p>
                <div>{p.stack?.map((t) => <span key={t} className="badge">{t}</span>)}</div>
                <div className="proj-links">
                  {p.links?.map((l) => (
                    <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer">{l.label} ↗</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {s.media?.length > 0 && (
        <>
          <h3>사진 · 영상</h3>
          <div className="media-list">
            {s.media.map((m, i) => (
              <figure key={i} className="media">
                {m.type === 'image' && <img src={m.src} alt={m.caption || `${s.name} 사진`} loading="lazy" />}
                {m.type === 'video' && <video src={m.src} controls preload="metadata" playsInline />}
                {m.type === 'youtube' && youtubeId(m.src) && (
                  <div className="yt">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${youtubeId(m.src)}`}
                      title={m.caption || `${s.name} 영상`}
                      loading="lazy"
                      sandbox="allow-scripts allow-same-origin allow-presentation"
                      allow="fullscreen"
                      allowFullScreen
                    />
                  </div>
                )}
                {m.caption && <figcaption>{m.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </>
      )}

      {s.tags?.length > 0 && (
        <>
          <h3>사용 기술·도구</h3>
          <div>{s.tags.map((t) => <span key={t} className="badge">{t}</span>)}</div>
        </>
      )}

      {facilities.length > 0 && (
        <>
          <h3>역 시설 안내</h3>
          <ul className="facilities">
            {facilities.map(([k, v]) => <li key={k}><span>{k}</span><span>{v}</span></li>)}
          </ul>
        </>
      )}

      {s.links?.length > 0 && (
        <>
          <h3>출구</h3>
          <div className="proj-links">
            {s.links.map((l) => (
              <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer">{l.label} ↗</a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
