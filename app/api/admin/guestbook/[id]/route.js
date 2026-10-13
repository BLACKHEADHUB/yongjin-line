import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb.js';
import { handle, json, requireDb } from '@/lib/api.js';
import { ValidationError } from '@/lib/validate.js';

export const dynamic = 'force-dynamic';

export const DELETE = handle(
  async (_request, { params }) => {
    requireDb();
    const id = (await params).id;
    if (typeof id !== 'string' || !/^[a-f0-9]{24}$/i.test(id)) throw new ValidationError('아이디 형식이 올바르지 않습니다.');
    const db = await getDb();
    await db.collection('guestbook').deleteOne({ _id: new ObjectId(id) });
    return json({ ok: true });
  },
  { admin: true, write: true },
);
