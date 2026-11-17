import { NextResponse } from 'next/server';
import { z } from 'zod';
import { guardApi } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase';
import { ORDER_STATUSES } from '@/lib/types';

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const params = await ctx.params;
  const g = await guardApi(); if (g) return g;
  const p = z.object({ status: z.enum(ORDER_STATUSES).optional(), courier: z.string().max(80).nullish(), tracking_no: z.string().max(80).nullish(), admin_note: z.string().max(500).nullish() }).safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: 'Invalid' }, { status: 400 });
  const db = supabaseAdmin();
  const { data: o } = await db.from('orders').select('payment_status,status').eq('id', params.id).single();
  if (!o) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (p.data.status && p.data.status !== 'Cancelled' && o.payment_status !== 'paid' && o.payment_status !== 'paid_stock_issue')
    return NextResponse.json({ error: 'Payment not received for this order' }, { status: 400 });
  await db.from('orders').update(p.data).eq('id', params.id);
  if (p.data.status === 'Cancelled') await db.rpc('restore_order_stock', { p_order_id: params.id });
  return NextResponse.json({ ok: true });
}
