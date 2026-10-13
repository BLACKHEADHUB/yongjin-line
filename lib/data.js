import { getDb, hasDb } from './mongodb.js';
import { seedProfile, seedProjects, seedStations } from '../data/seed.mjs';

// MongoDB 문서의 _id(ObjectId)는 브라우저로 넘길 수 없어서 제거한다.
const strip = ({ _id, ...rest }) => rest;
const clone = (v) => JSON.parse(JSON.stringify(v));

/**
 * 프로필, 프로젝트, 역을 읽는다.
 * DB가 없거나 연결에 실패하거나 비어 있으면 시드 데이터로 대신한다 (발표 날 DB가 안 돼도 사이트는 뜬다).
 */
export async function loadPortfolio() {
  if (hasDb()) {
    try {
      const db = await getDb();
      const [profile, projects, stations] = await Promise.all([
        db.collection('profile').findOne({ _id: 'main' }),
        db.collection('projects').find({}).sort({ order: 1 }).toArray(),
        db.collection('stations').find({}).sort({ order: 1 }).toArray(),
      ]);
      if (profile && stations.length > 0) {
        return { source: 'db', profile: strip(profile), projects: projects.map(strip), stations: stations.map(strip) };
      }
    } catch (err) {
      console.error('[db] 시드 데이터로 대체합니다:', err.message);
    }
  }
  return { source: 'seed', profile: strip(clone(seedProfile)), projects: clone(seedProjects), stations: clone(seedStations) };
}
