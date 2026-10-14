import { getDb } from '@/lib/mongodb.js';
import { ensureSeeded } from '@/lib/seed.js';
import { handle, json, readJson, requireDb } from '@/lib/api.js';
import { str, strArray, safeUrl, skills, ValidationError } from '@/lib/validate.js';

export const dynamic = 'force-dynamic';

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;

export const PUT = handle(
  async (request) => {
    requireDb();
    const b = await readJson(request);
    const email = str(b.email ?? '', { max: 254, label: '이메일' });
    if (email && !EMAIL.test(email)) throw new ValidationError('이메일 형식을 확인해 주세요.');
    // 허용한 필드만 골라서 저장한다 (그 밖의 필드는 무시).
    const data = {
      name: str(b.name, { min: 1, max: 30, label: '이름' }),
      nameEn: str(b.nameEn ?? '', { max: 40, label: '영문 표기' }),
      dept: str(b.dept ?? '', { max: 40, label: '학과' }),
      year: str(b.year ?? '', { max: 20, label: '학년' }),
      tagline: str(b.tagline ?? '', { max: 100, label: '한 줄 소개' }),
      about: str(b.about ?? '', { max: 800, label: '자기소개' }),
      skills: skills(b.skills ?? []),
      role: str(b.role ?? '', { max: 100, label: '직무 방향' }),
      interests: strArray(b.interests ?? [], { maxItems: 8, max: 20, label: '관심 분야' }),
      status: str(b.status ?? '', { max: 60, label: '현재 상태' }),
      email,
      github: safeUrl(b.github ?? '', { label: 'GitHub 주소' }),
      resumeUrl: safeUrl(b.resumeUrl ?? '', { label: '이력서 주소' }),
      farewell: str(b.farewell ?? '', { max: 200, label: '마지막 한 마디' }),
    };
    const db = await getDb();
    await ensureSeeded(db);
    await db.collection('profile').updateOne({ _id: 'main' }, { $set: data });
    return json({ ok: true });
  },
  { admin: true, write: true },
);
