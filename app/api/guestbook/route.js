import { getDb, hasDb } from '@/lib/mongodb.js';
import { handle, json, readJson, HttpError } from '@/lib/api.js';
import { ipHash } from '@/lib/request.js';
import { str } from '@/lib/validate.js';

export const dynamic = 'force-dynamic';

const COOLDOWN_MS = 30 * 1000; // 같은 사람이 연달아 쓰지 못하게 하는 간격
const MAX_ENTRIES = 2000; // 도배로 DB가 가득 차는 것을 막는 상한

// 인덱스는 서버 인스턴스마다 한 번만 만든다 (이미 있으면 MongoDB가 그대로 둔다).
let indexed = false;
async function collection() {
  const col = (await getDb()).collection('guestbook');
  if (!indexed) {
    await col.createIndexes([{ key: { createdAt: -1 } }, { key: { ipHash: 1, createdAt: -1 } }]);
    indexed = true;
  }
  return col;
}

export const GET = handle(async () => {
  if (!hasDb()) return json({ available: false, entries: [] });
  try {
    const docs = await (await collection()).find({}, { projection: { ipHash: 0 } }).sort({ createdAt: -1 }).limit(50).toArray();
    return json({
      available: true,
      entries: docs.map((d) => ({ id: String(d._id), name: d.name, message: d.message, createdAt: d.createdAt })),
    });
  } catch (err) {
    console.error('[guestbook]', err.message);
    return json({ available: false, entries: [] });
  }
});

export const POST = handle(
  async (request) => {
    if (!hasDb()) throw new HttpError(503, '방명록이 꺼져 있습니다.');
    const body = await readJson(request);
    // 사람은 보지 못하는 입력칸(website)이 채워져 있으면 봇이므로 성공한 척하고 버린다.
    if (body.website) return json({ ok: true });
    const name = str(body.name, { min: 1, max: 20, label: '이름' });
    const message = str(body.message, { min: 1, max: 200, label: '한 줄 메시지' });

    const col = await collection();
    const hash = ipHash(request);
    const last = await col.findOne({ ipHash: hash }, { sort: { createdAt: -1 } });
    if (last && Date.now() - last.createdAt.getTime() < COOLDOWN_MS) {
      throw new HttpError(429, '잠시 후에 다시 남겨 주세요.');
    }
    if ((await col.estimatedDocumentCount()) >= MAX_ENTRIES) throw new HttpError(503, '방명록이 가득 찼습니다.');
    await col.insertOne({ name, message, createdAt: new Date(), ipHash: hash });
    return json({ ok: true }, 201);
  },
  { write: true },
);
