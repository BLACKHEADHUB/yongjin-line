import { NextResponse } from 'next/server';
import { ValidationError } from './validate.js';
import { sameOrigin } from './request.js';

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const json = (data, status = 200) => NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } });

/**
 * API 핸들러 공통 보호막.
 *  - write: 쓰기 요청은 같은 사이트(Origin)에서 온 것만 허용 (CSRF 방어)
 *  - 검증 오류는 400, 그 외 오류는 내부 내용을 숨기고 500
 */
export function handle(fn, { write = false } = {}) {
  return async (request, ctx) => {
    try {
      if (write && !sameOrigin(request)) return json({ error: '허용되지 않은 요청입니다.' }, 403);
      return await fn(request, ctx);
    } catch (err) {
      if (err instanceof ValidationError) return json({ error: err.message }, 400);
      if (err instanceof HttpError) return json({ error: err.message }, err.status);
      console.error('[api]', err);
      return json({ error: '서버 오류가 발생했습니다.' }, 500);
    }
  };
}

/** 요청 본문을 JSON 객체로 읽는다. 너무 크거나 객체가 아니면 거부한다. */
export async function readJson(request, maxChars = 2000) {
  const text = await request.text();
  if (text.length > maxChars) throw new ValidationError('요청이 너무 큽니다.');
  let value;
  try {
    value = JSON.parse(text);
  } catch {
    throw new ValidationError('요청 형식이 올바르지 않습니다.');
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new ValidationError('요청 형식이 올바르지 않습니다.');
  return value;
}
