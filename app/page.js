import { profile, projects, stations } from '@/data/portfolio.js';
import { hasDb } from '@/lib/mongodb.js';
import PortfolioApp from '@/components/PortfolioApp';

// 내용은 data/portfolio.js에서 바로 읽는다. 빌드할 때 한 번 만들어 두는 정적 페이지라 빠르다.
export default function Home() {
  return <PortfolioApp data={{ profile, projects, stations }} guestbook={hasDb()} />;
}
