import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { fetchPayment, verifyCheckoutSignature } from '@/lib/razorpay';

const schema = z.object({ razorpay_order_id: z.string(), razorpay_payment_id: z.string(), razorpay_signature: z.string() });

export async function POST(req: Request) {
  const p = schema.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  const { razorpay_order_id: oid, razorpay_payment_id: pid, razorpay_signature: sig } = p.data;

  // 1. Signature must verify on the server – the browser callback alone proves nothing.
  if (!verifyCheckoutSignature(oid, pid, sig)) return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });

  const db = supabaseAdmin();
  const { data: order } = await db.from('orders').select('id,order_no,total').eq('razorpay_order_id', oid).single();
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  // 2. Cross-check amount/status with Razorpay.
  const pay = await fetchPayment(pid);
  if (!pay || pay.order_id !== oid || pay.amount !== Math.round(Number(order.total) * 100) || !['captured', 'authorized'].includes(pay.status))
    return NextResponse.json({ error: 'Payment not confirmed' }, { status: 400 });

  // 3. Atomic + idempotent: marks paid and deducts stock exactly once.
  const { data: result, error } = await db.rpc('confirm_order_payment', { p_order_id: order.id, p_payment_id: pid });
  if (error) { console.error(error); return NextResponse.json({ error: 'Could not confirm order' }, { status: 500 }); }
  return NextResponse.json({ orderNo: order.order_no, result });
}
