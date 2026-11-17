import { NextResponse } from 'next/server';
import { z } from 'zod';
import { guardApi } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase';

type Ctx = { params: Promise<{ id: string }> };
const kinds = z.enum(['front', 'back', 'gallery']);

export async function POST(req: Request, ctx: Ctx) {
  const params = await ctx.params;
  const g = await guardApi(); if (g) return g;
  const p = z.object({ url: z.string().url().max(500), kind: kinds }).safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: 'Invalid' }, { status: 400 });
  const db = supabaseAdmin();
  const { count } = await db.from('product_images').select('*', { count: 'exact', head: true }).eq('product_id', params.id);
  const { data } = await db.from('product_images').insert({ product_id: params.id, url: p.data.url, kind: p.data.kind, is_main: !count, sort_order: count || 0 }).select().single();
  return NextResponse.json(data);
}
// replace url / change kind / set main
export async function PATCH(req: Request, ctx: Ctx) {
  const params = await ctx.params;
  const g = await guardApi(); if (g) return g;
  const p = z.object({ imageId: z.string().uuid(), url: z.string().url().optional(), kind: kinds.optional(), main: z.boolean().optional() }).safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: 'Invalid' }, { status: 400 });
  const db = supabaseAdmin();
  if (p.data.main) {
    await db.from('product_images').update({ is_main: false }).eq('product_id', params.id);
    await db.from('product_images').update({ is_main: true }).eq('id', p.data.imageId).eq('product_id', params.id);
  }
  const patch: Record<string, string> = {};
  if (p.data.url) patch.url = p.data.url; if (p.data.kind) patch.kind = p.data.kind;
  if (Object.keys(patch).length) await db.from('product_images').update(patch).eq('id', p.data.imageId).eq('product_id', params.id);
  return NextResponse.json({ ok: true });
}
export async function DELETE(req: Request, ctx: Ctx) {
  const params = await ctx.params;
  const g = await guardApi(); if (g) return g;
  const imageId = new URL(req.url).searchParams.get('imageId') || '';
  const db = supabaseAdmin();
  const { data: del } = await db.from('product_images').delete().eq('id', imageId).eq('product_id', params.id).select().single();
  if (del?.is_main) { // promote the next image
    const { data: next } = await db.from('product_images').select('id').eq('product_id', params.id).order('sort_order').limit(1).maybeSingle();
    if (next) await db.from('product_images').update({ is_main: true }).eq('id', next.id);
  }
  return NextResponse.json({ ok: true });
}
