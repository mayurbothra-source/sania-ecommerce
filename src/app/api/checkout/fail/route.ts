import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';

// Records a failed/cancelled attempt. Only affects orders still 'pending' – never a paid order.
export async function POST(req: Request) {
  const p = z.object({ razorpay_order_id: z.string(), status: z.enum(['failed', 'cancelled']) }).safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: 'Invalid' }, { status: 400 });
  await supabaseAdmin().from('orders').update({ payment_status: p.data.status })
    .eq('razorpay_order_id', p.data.razorpay_order_id).eq('payment_status', 'pending');
  return NextResponse.json({ ok: true });
}
