import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { inr } from '@/lib/utils';

export default async function Dashboard() {
  const db = supabaseAdmin();
  const [{ data: orders }, { data: low }] = await Promise.all([
    db.from('orders').select('total,status,payment_status'),
    db.from('product_sizes').select('size,stock,products!inner(code,name,is_active)').eq('enabled', true).lte('stock', 5).eq('products.is_active', true).order('stock'),
  ]);
  const paid = (orders || []).filter((o) => ['paid', 'paid_stock_issue'].includes(o.payment_status) && o.status !== 'Cancelled');
  const stats = [
    ['Total orders', paid.length], ['Total sales', inr(paid.reduce((a, o) => a + Number(o.total), 0))],
    ['Pending orders', paid.filter((o) => ['Payment Confirmed', 'Processing', 'Dispatched'].includes(o.status)).length],
    ['Completed orders', paid.filter((o) => o.status === 'Delivered').length],
  ];
  const issues = (orders || []).filter((o) => o.payment_status === 'paid_stock_issue').length;
  return (
    <div>
      <h1 className="text-3xl">Dashboard</h1>
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">{stats.map(([l, v]) => <div key={l} className="card"><p className="label">{l}</p><p className="font-serif text-3xl text-burgundy">{v}</p></div>)}</div>
      {issues > 0 && <p className="mt-4 rounded bg-rose/50 p-3 text-sm">⚠ {issues} paid order(s) had a stock shortage and need a manual refund/alternative. <Link className="underline" href="/admin/orders">Open orders</Link></p>}
      <h2 className="mt-8 text-2xl">Low inventory (5 or fewer)</h2>
      {!low?.length ? <p className="mt-2 text-sm">Nothing low.</p> :
        <ul className="card mt-3 divide-y divide-rose/50 text-sm">{low.map((s, i) => { const p = s.products as unknown as { code: string; name: string }; return <li key={i} className="flex justify-between py-2"><span>{p.code} {p.name} · Size {s.size}</span><b className={s.stock === 0 ? 'text-rosedeep' : ''}>{s.stock} left</b></li>; })}</ul>}
    </div>
  );
}
