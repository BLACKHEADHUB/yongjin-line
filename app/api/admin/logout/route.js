import { NextResponse } from 'next/server';
import { COOKIE, cookieOptions } from '@/lib/auth.js';
import { handle } from '@/lib/api.js';

export const dynamic = 'force-dynamic';

export const POST = handle(
  async () => {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE, '', { ...cookieOptions, maxAge: 0 });
    return res;
  },
  { write: true },
);
