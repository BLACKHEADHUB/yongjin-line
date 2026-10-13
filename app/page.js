import { loadPortfolio } from '@/lib/data.js';
import PortfolioApp from '@/components/PortfolioApp';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const data = await loadPortfolio();
  return <PortfolioApp data={data} />;
}
