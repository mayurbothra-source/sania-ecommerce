import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import { inr } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Order confirmation', robots: { index: false } };

// Access requires the Razorpay order id (rid) that only the paying browser holds.
export default async function Confirmation(props: { params: Promise<{ orderNo: string }>; searchParams: Promise<{ rid?: string }> }) {
  const params = await props.params, searchParams = await props.searchParams;
  if (!searchParams.rid) notFound();
  const { data: o } = await supabaseAdmin().from('orders').select('*, order_items(*)').eq('order_no', params.orderNo).eq('razorpay_order_id', searchParams.rid).maybeSingle();
  if (!o) notFound();
  const paid = o.payment_status === 'paid' || o.payment_status === 'paid_stock_issue';
  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="text-4xl">{paid ? 'Thank you! Your order is confirmed.' : 'Payment pending'}</h1>
      {!paid && <p className="mt-2">We have not received a confirmation for this payment yet. If you were charged, it will update here shortly.</p>}
      <div className="card mt-6 space-y-2 text-sm">
        <p><b>Order ID:</b> {o.order_no}</p>
        <p><b>Payment:</b> {o.payment_status === 'paid' || o.payment_status === 'paid_stock_issue' ? 'Paid' : o.payment_status}{o.razorpay_payment_id && <> · Ref {o.razorpay_payment_id}</>}</p>
        <p><b>Amount:</b> {inr(o.total)}</p>
        <p><b>Delivering to:</b> {o.customer_name}, {o.address}, {o.city}, {o.state} {o.pincode}</p>
        <ul className="mt-3 list-disc pl-5">{o.order_items.map((i: { id: string; code: string; name: string; size: string; qty: number }) => <li key={i.id}>{i.code} {i.name} · Size {i.size} × {i.qty}</li>)}</ul>
        {o.payment_status === 'paid_stock_issue' && <p className="rounded bg-rose/40 p-3">An item sold out just as you paid. We’ll contact you shortly to arrange an alternative or a full refund.</p>}
      </div>
      <p className="mt-4 text-sm">Save your Order ID. Track it anytime with your mobile number.</p>
      <div className="mt-6 flex gap-3"><Link href="/track" className="btn-outline">Track order</Link><Link href="/shop" className="btn-primary">Continue shopping</Link></div>
    </div>
  );
}
