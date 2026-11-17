import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import { inr } from '@/lib/utils';
import OrderEditor from './OrderEditor';

export default async function OrderPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { data: o } = await supabaseAdmin().from('orders').select('*, order_items(*)').eq('id', params.id).maybeSingle();
  if (!o) notFound();
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl">Order {o.order_no}</h1>
      <div className="card mt-4 space-y-1 text-sm">
        <p><b>{o.customer_name}</b> · {o.mobile} · {o.email}</p>
        <p>{o.address}, {o.city}, {o.state} – {o.pincode}</p>
        <p>Placed {new Date(o.created_at).toLocaleString('en-IN')} · Payment: <b>{o.payment_status}</b>{o.razorpay_payment_id && ` (${o.razorpay_payment_id})`}</p>
        {o.payment_status === 'paid_stock_issue' && <p className="rounded bg-rose/50 p-2 font-medium">Customer paid but stock ran out. Contact them to offer an alternative, or refund via the Razorpay dashboard, then cancel this order.</p>}
        <ul className="mt-2 divide-y divide-rose/50">{o.order_items.map((i: { id: string; code: string; name: string; size: string; qty: number; unit_price: number }) => <li key={i.id} className="flex justify-between py-1.5"><span>{i.code} {i.name} · Size {i.size} × {i.qty}</span><span>{inr(i.unit_price * i.qty)}</span></li>)}</ul>
        <p className="text-right">Subtotal {inr(o.subtotal)} · Shipping {inr(o.shipping)} · <b>Total {inr(o.total)}</b></p>
      </div>
      <OrderEditor id={o.id} status={o.status} courier={o.courier || ''} tracking={o.tracking_no || ''} note={o.admin_note || ''} />
    </div>
  );
}
