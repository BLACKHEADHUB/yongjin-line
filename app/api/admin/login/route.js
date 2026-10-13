import { NextResponse } from 'next/server';
import { COOKIE, checkPassword, createSessionToken, cookieOptions, clientIp } from '@/lib/auth.js';
import { handle, readJson, HttpError } from '@/lib/api.js';

export const dynamic = 'force-dynamic';

// 로그인 시도 제한: 같은 IP에서 10분에 5번까지 (서버가 여러 대로 나뉘면 완벽하진 않은 최소한의 방어)
const attempts = (globalThis._yongjinAttempts ??= new Map());
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const POST = handle(
  async (request) => {
    if (!process.env.ADMIN_PASSWORD) throw new HttpError(503, '관리자 비밀번호(ADMIN_PASSWORD)가 설정되지 않았습니다.');
    const ip = clientIp(request);
    const now = Date.now();
    const rec = attempts.get(ip);
    if (rec && rec.resetAt > now && rec.count >= MAX_ATTEMPTS) throw new HttpError(429, '시도 횟수를 넘었습니다. 잠시 후에 다시 해 주세요.');

    const body = await readJson(request, 1000);
    if (!checkPassword(body.password)) {
      const next = rec && rec.resetAt > now ? rec : { count: 0, resetAt: now + WINDOW_MS };
      next.count += 1;
      attempts.set(ip, next);
      await sleep(500); // 무차별 대입을 느리게 만든다
      throw new HttpError(401, '비밀번호가 올바르지 않습니다.');
    }
    attempts.delete(ip);
    const res = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
    res.cookies.set(COOKIE, createSessionToken(), cookieOptions);
    return res;
  },
  { write: true },
);
