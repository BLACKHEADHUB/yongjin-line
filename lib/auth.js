import crypto from 'node:crypto';
import { cookies } from 'next/headers';

export const COOKIE = 'admin_session';
const TTL_SECONDS = 60 * 60 * 8; // 로그인 유지 시간: 8시간

// 쿠키 서명에 쓰는 비밀 값. SESSION_SECRET이 없으면 관리자 비밀번호로 대신한다.
const secret = () => process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || '';
const sign = (payload) => crypto.createHmac('sha256', secret()).update(payload).digest('base64url');

/** 비밀번호 비교. 길이가 달라도 같은 시간이 걸리도록 해시를 만들어 timingSafeEqual로 비교한다. */
export function checkPassword(input) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || typeof input !== 'string') return false;
  const a = crypto.createHash('sha256').update(input).digest();
  const b = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

export function createSessionToken() {
  const exp = String(Math.floor(Date.now() / 1000) + TTL_SECONDS);
  return `${exp}.${sign(exp)}`;
}

export function verifySessionToken(token) {
  if (!secret() || typeof token !== 'string') return false;
  const [exp, sig] = token.split('.');
  if (!exp || !sig || !/^\d+$/.test(exp)) return false;
  const expected = sign(exp);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  return Number(exp) > Date.now() / 1000;
}

export const cookieOptions = {
  httpOnly: true, // 자바스크립트로 읽을 수 없어서 XSS로 훔치기 어렵다
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict', // 다른 사이트에서 보낸 요청에는 쿠키가 붙지 않는다 (CSRF 방어)
  path: '/',
  maxAge: TTL_SECONDS,
};

export async function isAdmin() {
  const store = await cookies();
  return verifySessionToken(store.get(COOKIE)?.value);
}

/** 쓰기 요청이 우리 사이트에서 왔는지 확인한다 (Origin 헤더와 Host 비교). */
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

export function clientIp(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
}

export function ipHash(request) {
  return crypto.createHash('sha256').update(clientIp(request) + secret()).digest('hex').slice(0, 24);
}
