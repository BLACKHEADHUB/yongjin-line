// 차임음(Web Audio)과 안내방송(speechSynthesis). 소리는 사용자가 켰을 때만 호출한다.
let ctx;

function ensure() {
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return true;
  } catch {
    return false;
  }
}

function tone(freq, start, dur, type = 'sine', vol = 0.18) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, ctx.currentTime + start);
  g.gain.linearRampToValueAtTime(vol, ctx.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
  o.connect(g).connect(ctx.destination);
  o.start(ctx.currentTime + start);
  o.stop(ctx.currentTime + start + dur + 0.05);
}

export function chime() {
  if (!ensure()) return;
  [[659, 0], [523, 0.22], [784, 0.44]].forEach(([f, s]) => tone(f, s, 0.5));
}

export function beep() {
  if (!ensure()) return;
  tone(1320, 0, 0.12, 'square', 0.08);
  tone(1760, 0.13, 0.15, 'square', 0.08);
}

export function speak(text) {
  if (!text || !('speechSynthesis' in window)) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ko-KR';
    u.rate = 1.05;
    const ko = speechSynthesis.getVoices().find((v) => v.lang && v.lang.startsWith('ko'));
    if (ko) u.voice = ko;
    setTimeout(() => speechSynthesis.speak(u), 900); // 차임이 끝난 뒤에 방송
  } catch {
    /* 음성을 지원하지 않는 브라우저는 조용히 넘어간다 */
  }
}

export function stopSpeech() {
  try {
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  } catch {
    /* 무시 */
  }
}
