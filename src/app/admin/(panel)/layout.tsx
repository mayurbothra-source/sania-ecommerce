import Link from 'next/link';
import { requireAdminPage } from '@/lib/adminAuth';
import LogoutButton from './LogoutButton';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin', robots: { index: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  const links = [['/admin', 'Dashboard'], ['/admin/products', 'Products'], ['/admin/orders', 'Orders'], ['/admin/testimonials', 'Testimonials'], ['/admin/settings', 'Shipping']];
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <nav className="mb-6 flex flex-wrap items-center gap-4 border-b border-rose pb-3 text-sm">
        {links.map(([h, l]) => <Link key={h} href={h} className="font-medium text-burgundy hover:text-mustard">{l}</Link>)}
        <span className="ml-auto flex gap-4"><Link href="/" className="text-burgundy/70">View shop</Link><LogoutButton /></span>
      </nav>
      {children}
    </div>
  );
}
