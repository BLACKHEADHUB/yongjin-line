import { loadContent } from '@/lib/content.js';
import { hasDb } from '@/lib/mongodb.js';
import PortfolioApp from '@/components/PortfolioApp';

// 내용은 MongoDB에서 읽는다 (실패하면 data/portfolio.js). 1분 동안은 결과를 재사용해서 DB를 매번 부르지 않는다.
export const revalidate = 60;

export default async function Home() {
  const { profile, projects, stations } = await loadContent();
  return <PortfolioApp data={{ profile, projects, stations }} guestbook={hasDb()} />;
}
