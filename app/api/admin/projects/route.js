import { getDb } from '@/lib/mongodb.js';
import { ensureSeeded } from '@/lib/seed.js';
import { handle, json, readJson, requireDb, HttpError } from '@/lib/api.js';
import * as v from '@/lib/validate.js';

export const dynamic = 'force-dynamic';

// 프로젝트 추가 또는 수정 (slug가 같으면 수정)
export const POST = handle(
  async (request) => {
    requireDb();
    const b = await readJson(request);
    const slug = v.id(b.slug, '프로젝트 아이디(영문 소문자, 숫자, -)');
    const data = {
      name: v.str(b.name, { min: 1, max: 60, label: '프로젝트 이름' }),
      summary: v.str(b.summary ?? '', { max: 300, label: '한 줄 설명' }),
      stack: v.strArray(b.stack ?? [], { maxItems: 12, max: 24, label: '기술' }),
      links: v.links(b.links ?? []),
      image: v.safeUrl(b.image ?? '', { label: '이미지 주소' }),
      featured: v.bool(b.featured),
      order: v.int(b.order ?? 99, { min: 0, max: 999, label: '순서' }),
    };
    const db = await getDb();
    await ensureSeeded(db);
    if ((await db.collection('projects').countDocuments()) >= 30) {
      const exists = await db.collection('projects').findOne({ slug });
      if (!exists) throw new HttpError(400, '프로젝트는 30개까지 만들 수 있습니다.');
    }
    await db.collection('projects').updateOne({ slug }, { $set: data, $setOnInsert: { slug } }, { upsert: true });
    return json({ ok: true });
  },
  { admin: true, write: true },
);
