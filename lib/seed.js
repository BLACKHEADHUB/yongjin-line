import { seedProfile, seedProjects, seedStations } from '../data/seed.mjs';

/**
 * 비어 있는 컬렉션에만 시드 데이터를 넣는다. reset=true면 전부 덮어쓴다.
 * 관리 화면에서 수정한 내용이 시드로 덮이지 않도록 기본은 "없는 것만 넣기"다.
 */
export async function ensureSeeded(db, { reset = false } = {}) {
  const profile = db.collection('profile');
  const projects = db.collection('projects');
  const stations = db.collection('stations');

  if (reset) {
    await Promise.all([profile.deleteMany({}), projects.deleteMany({}), stations.deleteMany({})]);
  }
  const result = { profile: 0, projects: 0, stations: 0 };

  if (!(await profile.findOne({ _id: 'main' }))) {
    await profile.insertOne({ ...seedProfile });
    result.profile = 1;
  }
  if ((await projects.countDocuments()) === 0) {
    await projects.insertMany(seedProjects.map((p) => ({ ...p })));
    result.projects = seedProjects.length;
  }
  if ((await stations.countDocuments()) === 0) {
    await stations.insertMany(seedStations.map((s) => ({ ...s })));
    result.stations = seedStations.length;
  }

  // 조회 속도와 중복 방지를 위한 인덱스
  await stations.createIndex({ id: 1 }, { unique: true });
  await stations.createIndex({ order: 1 });
  await projects.createIndex({ slug: 1 }, { unique: true });
  await db.collection('guestbook').createIndex({ createdAt: -1 });
  await db.collection('guestbook').createIndex({ ipHash: 1, createdAt: -1 });
  return result;
}
