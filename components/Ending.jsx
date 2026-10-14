'use client';
import { useState } from 'react';
import { beep } from './audio';

// 엔딩: 승차권 모양 연락처 카드
export default function Ending({ profile: p, firstStation, sound, onClose, onGuestbook }) {
  const [issued, setIssued] = useState(false);
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="승차권" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ticket">
        <button type="button" className="panel-close" onClick={onClose} aria-label="닫기">×</button>
        <p className="ticket-kicker">승차권 · BOARDING PASS</p>
        <div className="ticket-route">
          <div><small>출발</small><strong>{firstStation}</strong></div>
          <span className="ticket-arrow">→</span>
          <div><small>도착</small><strong>미정</strong></div>
        </div>
        <p className="ticket-msg">이 열차의 종착역은 아직 정해지지 않았습니다.</p>
        <ul className="ticket-contacts">
          {p.email && <li>✉️ <a href={`mailto:${p.email}`}>{p.email}</a></li>}
          {p.github && <li>🐙 <a href={p.github} target="_blank" rel="noopener noreferrer">{p.github.replace(/^https?:\/\//, '')}</a></li>}
          {p.resumeUrl && <li>📄 <a href={p.resumeUrl} target="_blank" rel="noopener noreferrer">이력서 PDF</a></li>}
        </ul>
        <div className="ticket-actions">
          <button
            type="button"
            className="issue-btn"
            onClick={() => {
              if (sound) beep();
              setIssued(true);
            }}
          >
            승차권 발급
          </button>
          {onGuestbook && <button type="button" className="btn" onClick={onGuestbook}>방명록 남기기</button>}
        </div>
        <p className={`farewell${issued ? ' show' : ''}`}>{p.farewell}</p>
      </div>
    </div>
  );
}
