// 사용법: npm run seed            (비어 있는 컬렉션에만 초기 데이터를 넣는다)
//        npm run seed -- --reset  (전부 지우고 data/seed.mjs로 다시 채운다. 관리 화면에서 수정한 내용도 사라진다)
import { MongoClient } from 'mongodb';
import { ensureSeeded } from '../lib/seed.js';

try {
  process.loadEnvFile('.env.local');
} catch {
  /* .env.local이 없으면 이미 설정된 환경변수를 쓴다 */
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI가 없습니다. .env.local에 값을 넣고 다시 실행해 주세요.');
  process.exit(1);
}
const reset = process.argv.includes('--reset');

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
try {
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || 'yongjin_line');
  const result = await ensureSeeded(db, { reset });
  console.log(`${reset ? '초기화 후 ' : ''}시드 완료:`, result);
} catch (err) {
  console.error('시드 실패:', err.message);
  process.exitCode = 1;
} finally {
  await client.close();
}
