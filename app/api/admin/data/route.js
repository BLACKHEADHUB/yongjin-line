import { loadPortfolio } from '@/lib/data.js';
import { getDb, hasDb } from '@/lib/mongodb.js';
import { handle, json } from '@/lib/api.js';

export const dynamic = 'force-dynamic';

export const GET = handle(
  async () => {
    const data = await loadPortfolio();
    let guestbook = [];
    if (hasDb()) {
      try {
        const db = await getDb();
        const docs = await db.collection('guestbook').find({}, { projection: { ipHash: 0 } }).sort({ createdAt: -1 }).limit(200).toArray();
        guestbook = docs.map((d) => ({ id: String(d._id), name: d.name, message: d.message, createdAt: d.createdAt }));
      } catch (err) {
        console.error('[admin/data]', err.message);
      }
    }
    return json({ ...data, dbConfigured: hasDb(), guestbook });
  },
  { admin: true },
);
