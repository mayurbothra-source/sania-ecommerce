import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { inr } from '@/lib/utils';

export default async function Orders(props: { searchParams: Promise<{ q?: string; show?: string }> }) {
  const searchParams = await props.searchParams;
  const q = (searchParams.q || '').trim().replace(/[%,()]/g, '');
  let query = supabaseAdmin().from('orders').select('id,order_no,customer_name,mobile,total,status,payment_status,created_at').order('created_at', { ascending: false }).limit(200);
  if (q) query = query.or(`order_no.ilike.%${q}%,customer_name.ilike.%${q}%,mobile.ilike.%${q}%`);
  if (searchParams.show !== 'all') query = query.in('payment_status', ['paid', 'paid_stock_issue']);
  const { data } = await query;
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl">Orders</h1><a href="/api/admin/orders/export" className="btn-outline">Export CSV</a></div>
      <form className="mt-4 flex gap-2"><input name="q" defaultValue={q} placeholder="Search order ID, name or mobile" className="input max-w-sm" />
        <select name="show" defaultValue={searchParams.show || ''} className="input w-auto"><option value="">Paid orders</option><option value="all">All incl. unpaid/failed</option></select><button className="btn-primary">Search</button></form>
      <div className="mt-4 overflow-x-auto"><table className="card w-full text-left text-sm">
        <thead><tr className="text-xs uppercase text-burgundy"><th className="p-2">Order</th><th>Date</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead>
        <tbody>{(data || []).map((o) => (
          <tr key={o.id} className="border-t border-rose/50"><td className="p-2"><Link className="underline" href={`/admin/orders/${o.id}`}>{o.order_no}</Link></td>
            <td>{new Date(o.created_at).toLocaleDateString('en-IN')}</td><td>{o.customer_name}<br /><span className="text-xs">{o.mobile}</span></td><td>{inr(o.total)}</td>
            <td className={o.payment_status === 'paid_stock_issue' ? 'font-bold text-rosedeep' : ''}>{o.payment_status === 'paid_stock_issue' ? 'Paid – STOCK ISSUE' : o.payment_status}</td><td>{o.status}</td></tr>
        ))}</tbody></table>{!data?.length && <p className="p-4 text-sm">No orders found.</p>}</div>
    </div>
  );
}
