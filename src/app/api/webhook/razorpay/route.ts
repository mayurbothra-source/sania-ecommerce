import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyWebhookSignature } from '@/lib/razorpay';

// Backup path: confirms payments even if the customer closes the browser before the callback.
// Razorpay Dashboard > Webhooks: URL https://YOUR-DOMAIN/api/webhook/razorpay, events payment.captured, order.paid, payment.failed
export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyWebhookSignature(raw, req.headers.get('x-razorpay-signature') || '')) return NextResponse.json({ error: 'bad signature' }, { status: 400 });
  const ev = JSON.parse(raw);
  const pay = ev.payload?.payment?.entity;
  if (!pay?.order_id) return NextResponse.json({ ok: true });
  const db = supabaseAdmin();
  const { data: order } = await db.from('orders').select('id,total').eq('razorpay_order_id', pay.order_id).single();
  if (!order) return NextResponse.json({ ok: true });
  if ((ev.event === 'payment.captured' || ev.event === 'order.paid') && pay.amount === Math.round(Number(order.total) * 100))
    await db.rpc('confirm_order_payment', { p_order_id: order.id, p_payment_id: pay.id });
  else if (ev.event === 'payment.failed')
    await db.from('orders').update({ payment_status: 'failed' }).eq('id', order.id).eq('payment_status', 'pending');
  return NextResponse.json({ ok: true });
}
