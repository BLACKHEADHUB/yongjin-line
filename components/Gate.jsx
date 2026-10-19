'use client';

// 개찰구: 카드를 찍으면 다음 화면으로 넘어간다.
export default function Gate({ name, onEnter }) {
  return (
    <main>
      <h1>개찰구</h1>
      <p>{name}님의 교통카드를 찍어 주세요.</p>
      <button type="button" onClick={onEnter}>카드 찍기</button>
    </main>
  );
}
