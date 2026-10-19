'use client';

// 개찰구: 교통카드를 누르면(찍으면) 다음 화면으로 넘어간다.
export default function Gate({ name, school, onEnter }) {
  return (
    <main className="gate">
      <h1>개찰구</h1>
      <p>교통카드를 찍어 주세요.</p>
      <button type="button" className="tapcard" onClick={onEnter}>
        <strong>용진선 교통카드</strong>
        <span>{[school, name].filter(Boolean).join(' ')}</span>
      </button>
    </main>
  );
}
