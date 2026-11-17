import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  const p = z.object({ orderNo: z.string().trim().min(5).max(30), mobile: z.string().regex(/^\d{10}$/) }).safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: 'Enter your order ID and 10-digit mobile number' }, { status: 400 });
  const { data } = await supabaseAdmin().from('orders')
    .select('order_no,status,payment_status,total,created_at,courier,tracking_no,order_items(name,code,size,qty)')
    .eq('order_no', p.data.orderNo.toUpperCase()).eq('mobile', p.data.mobile).maybeSingle();
  if (!data) return NextResponse.json({ error: 'No order found for these details' }, { status: 404 });
  return NextResponse.json(data);
}
