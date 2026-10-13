import { getDb } from '@/lib/mongodb.js';
import { ensureSeeded } from '@/lib/seed.js';
import { handle, json, readJson, requireDb, HttpError } from '@/lib/api.js';
import * as v from '@/lib/validate.js';

export const dynamic = 'force-dynamic';

export const PUT = handle(
  async (request, { params }) => {
    requireDb();
    const id = v.id((await params).id, '역 아이디');
    const b = await readJson(request);
    const data = {
      name: v.str(b.name, { min: 1, max: 20, label: '역 이름' }),
      en: v.str(b.en ?? '', { max: 40, label: '영문 이름' }),
      subtitle: v.str(b.subtitle ?? '', { max: 60, label: '부제' }),
      story: v.strArray(b.story ?? [], { maxItems: 8, max: 600, label: '이야기' }),
      tags: v.strArray(b.tags ?? [], { maxItems: 8, max: 24, label: '기술 태그' }),
      facilities: v.facilities(b.facilities ?? {}),
      media: v.media(b.media ?? []),
      links: v.links(b.links ?? []),
      announce: v.str(b.announce ?? '', { max: 160, label: '안내방송 문구' }),
    };
    const db = await getDb();
    await ensureSeeded(db);
    const result = await db.collection('stations').updateOne({ id }, { $set: data });
    if (result.matchedCount === 0) throw new HttpError(404, '없는 역입니다.');
    return json({ ok: true });
  },
  { admin: true, write: true },
);
