import { NextResponse } from 'next/server';
import { z } from 'zod';
import { priceCart } from '@/lib/pricing';
import { supabaseAdmin } from '@/lib/supabase';
import { createRazorpayOrder, newOrderNo } from '@/lib/razorpay';

const schema = z.object({
  items: z.array(z.object({ productId: z.string().uuid(), size: z.string().min(1).max(10), qty: z.number().int().min(1).max(10) })).min(1).max(30),
  customer: z.object({
    name: z.string().trim().min(2).max(80),
    mobile: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
    email: z.string().email().max(120),
    address: z.string().trim().min(8).max(300),
    city: z.string().trim().min(2).max(60),
    state: z.string().trim().min(2).max(60),
    pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit PIN code'),
  }),
});

export async function POST(req: Request) {
  const p = schema.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: p.error.issues[0].message }, { status: 400 });
  const { items, customer: c } = p.data;

  const priced = await priceCart(items);               // server-side prices + stock check
  if (!priced.ok) return NextResponse.json({ error: 'Some items are unavailable', lines: priced.lines }, { status: 409 });

  const db = supabaseAdmin();
  const orderNo = newOrderNo();
  const { data: order, error } = await db.from('orders').insert({
    order_no: orderNo, customer_name: c.name, mobile: c.mobile, email: c.email.toLowerCase(), address: c.address,
    city: c.city, state: c.state, pincode: c.pincode, subtotal: priced.subtotal, shipping: priced.shipping, total: priced.total,
  }).select('id').single();
  if (error || !order) return NextResponse.json({ error: 'Could not create order' }, { status: 500 });

  await db.from('order_items').insert(priced.lines.map((l) => ({
    order_id: order.id, product_id: l.productId, code: l.code, name: l.name, size: l.size, qty: l.qty, unit_price: l.unitPrice, image: l.image,
  })));

  try {
    const rz = await createRazorpayOrder(Math.round(priced.total * 100), orderNo);
    await db.from('orders').update({ razorpay_order_id: rz.id }).eq('id', order.id);
    return NextResponse.json({ orderNo, razorpayOrderId: rz.id, amount: Math.round(priced.total * 100), key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID });
  } catch (e) {
    await db.from('orders').update({ payment_status: 'failed' }).eq('id', order.id);
    console.error(e);
    return NextResponse.json({ error: 'Payment gateway unavailable. Please try again.' }, { status: 502 });
  }
}
