import { isAdmin } from '@/lib/auth.js';
import { hasDb } from '@/lib/mongodb.js';
import AdminApp from '@/components/AdminApp';

export const dynamic = 'force-dynamic';
export const metadata = { title: '관리자 | 용진선', robots: { index: false, follow: false } };

export default async function AdminPage() {
  const authed = await isAdmin();
  return <AdminApp authed={authed} dbReady={hasDb()} />;
}
