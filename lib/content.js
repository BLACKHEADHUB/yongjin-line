import crypto from 'node:crypto';
import { profile as codeProfile, projects as codeProjects, stations as codeStations } from '../data/portfolio.js';
import { getDb, hasDb } from './mongodb.js';

const code = { profile: codeProfile, projects: codeProjects, stations: codeStations };
const hash = crypto.createHash('sha1').update(JSON.stringify(code)).digest('hex');
const strip = ({ _id, ...rest }) => rest;

/**
 * 포트폴리오 내용을 MongoDB에서 읽는다. 내용의 원본은 data/portfolio.js이고,
 * 파일 내용이 바뀐 것을 감지하면(해시 비교) 처음 읽을 때 DB에 자동으로 맞춰 넣는다.
 * 그래서 시드 명령이나 관리 화면이 필요 없다. DB가 없거나 실패하면 코드의 내용을 그대로 쓴다.
 */
export async function loadContent() {
  if (!hasDb()) return { source: 'code', ...code };
  try {
    return await loadFrom(await getDb());
  } catch (err) {
    console.error('[content] 코드의 내용으로 대체합니다:', err.message);
    return { source: 'code', ...code };
  }
}

export async function loadFrom(db) {
  const meta = db.collection('meta');
  if ((await meta.findOne({ _id: 'content' }))?.hash !== hash) await sync(db, meta);
  const [profile, projects, stations] = await Promise.all([
    db.collection('profile').findOne({ _id: 'main' }),
    db.collection('projects').find({}).sort({ order: 1 }).toArray(),
    db.collection('stations').find({}).sort({ order: 1 }).toArray(),
  ]);
  if (!profile || projects.length === 0 || stations.length === 0) throw new Error('DB 내용이 비어 있습니다.');
  return { source: 'db', profile: strip(profile), projects: projects.map(strip), stations: stations.map(strip) };
}

// 코드의 내용을 DB에 그대로 맞춘다. 여러 번 실행해도 결과가 같다 (upsert + 없어진 항목 삭제).
async function sync(db, meta) {
  await Promise.all([
    db.collection('projects').createIndex({ slug: 1 }, { unique: true }),
    db.collection('stations').createIndex({ id: 1 }, { unique: true }),
  ]);
  await db.collection('profile').replaceOne({ _id: 'main' }, code.profile, { upsert: true }); // upsert면 MongoDB가 _id를 filter 값으로 채운다
  const bulk = (key, docs) =>
    docs.map((d) => ({ replaceOne: { filter: { [key]: d[key] }, replacement: d, upsert: true } }));
  await db.collection('projects').bulkWrite(bulk('slug', code.projects));
  await db.collection('projects').deleteMany({ slug: { $nin: code.projects.map((p) => p.slug) } });
  await db.collection('stations').bulkWrite(bulk('id', code.stations));
  await db.collection('stations').deleteMany({ id: { $nin: code.stations.map((s) => s.id) } });
  await meta.replaceOne({ _id: 'content' }, { _id: 'content', hash, syncedAt: new Date() }, { upsert: true });
}
