import { youtubeId } from '@/lib/validate.js';

// 역 하나의 내용(이야기, 사진·영상, 기술, 시설 안내, 링크). 패널과 목록 보기에서 같이 쓴다.
export default function StationBody({ station: s }) {
  const facilities = Object.entries(s.facilities || {});
  return (
    <div className="station-body">
      {(s.story || []).map((p, i) => (
        <p key={i} className={`episode${p.startsWith('TODO') ? ' todo' : ''}`}>
          {p}
        </p>
      ))}

      {s.media?.length > 0 && (
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
      )}

      {s.tags?.length > 0 && (
        <>
          <h3>사용 기술·도구</h3>
          <div className="badges">
            {s.tags.map((t) => (
              <span key={t} className="badge">
                {t}
              </span>
            ))}
          </div>
        </>
      )}

      {facilities.length > 0 && (
        <>
          <h3>역 시설 안내</h3>
          <ul className="facilities">
            {facilities.map(([k, v]) => (
              <li key={k}>
                <span>{k}</span>
                <span>{v}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {s.links?.length > 0 && (
        <>
          <h3>출구</h3>
          <div className="exits">
            {s.links.map((l, i) => (
              <a key={l.url} className="exit" href={l.url} target="_blank" rel="noopener noreferrer">
                <span className="exit-no">{i + 1}</span>
                {l.label}
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
