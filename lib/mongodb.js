import { MongoClient } from 'mongodb';

// 서버리스 환경에서는 요청마다 새 연결을 만들면 연결이 계속 늘어난다.
// 그래서 연결(Promise)을 globalThis에 캐시해서 재사용한다.
const cache = (globalThis._yongjinMongo ??= { promise: null });

export function hasDb() {
  return Boolean(process.env.MONGODB_URI);
}

export async function getDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI가 설정되지 않았습니다.');
  if (!cache.promise) {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 4000, maxPoolSize: 5 });
    cache.promise = client.connect().catch((err) => {
      cache.promise = null; // 실패하면 다음 요청에서 다시 시도
      throw err;
    });
  }
  const client = await cache.promise;
  return client.db(process.env.MONGODB_DB || 'yongjin_line');
}
