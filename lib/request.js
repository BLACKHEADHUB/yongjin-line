import crypto from 'node:crypto';

/** 쓰기 요청이 우리 사이트에서 왔는지 확인한다 (Origin 헤더와 Host 비교, CSRF 방어). */
export function sameOrigin(request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** IP는 원문으로 저장하지 않고, 서버만 아는 값(DB 주소)을 섞어 해시로만 남긴다. */
export function ipHash(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  return crypto.createHash('sha256').update(ip + (process.env.MONGODB_URI || '')).digest('hex').slice(0, 24);
}
