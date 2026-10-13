import { getDb } from '@/lib/mongodb.js';
import { handle, json, requireDb } from '@/lib/api.js';
import * as v from '@/lib/validate.js';

export const dynamic = 'force-dynamic';

export const DELETE = handle(
  async (_request, { params }) => {
    requireDb();
    const slug = v.id((await params).slug, '프로젝트 아이디');
    const db = await getDb();
    await db.collection('projects').deleteOne({ slug });
    return json({ ok: true });
  },
  { admin: true, write: true },
);
