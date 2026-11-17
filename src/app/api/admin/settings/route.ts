import { NextResponse } from 'next/server';
import { z } from 'zod';
import { guardApi } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(req: Request) {
  const g = await guardApi(); if (g) return g;
  const p = z.object({ shipping_charge: z.number().min(0), free_shipping_above: z.number().min(0) }).safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: 'Invalid' }, { status: 400 });
  await supabaseAdmin().from('settings').upsert(Object.entries(p.data).map(([key, v]) => ({ key, value: String(v) })));
  return NextResponse.json({ ok: true });
}
