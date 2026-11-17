import { NextResponse } from 'next/server';
import { z } from 'zod';
import { guardApi } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase';

const s = z.object({ id: z.string().uuid().optional(), name: z.string().trim().min(1).max(60), city: z.string().max(60).nullish(), quote: z.string().trim().min(3).max(400), is_active: z.boolean().default(true) });
export async function POST(req: Request) {
  const g = await guardApi(); if (g) return g;
  const p = s.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: 'Invalid' }, { status: 400 });
  const { id, ...f } = p.data; const db = supabaseAdmin();
  const { error } = id ? await db.from('testimonials').update(f).eq('id', id) : await db.from('testimonials').insert(f);
  return error ? NextResponse.json({ error: 'Save failed' }, { status: 500 }) : NextResponse.json({ ok: true });
}
export async function DELETE(req: Request) {
  const g = await guardApi(); if (g) return g;
  await supabaseAdmin().from('testimonials').delete().eq('id', new URL(req.url).searchParams.get('id') || '');
  return NextResponse.json({ ok: true });
}
