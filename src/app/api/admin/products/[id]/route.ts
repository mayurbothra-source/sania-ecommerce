import { NextResponse } from 'next/server';
import { guardApi } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase';
import { slugify } from '@/lib/utils';
import { productSchema } from '@/lib/schemas';

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const params = await ctx.params;
  const g = await guardApi(); if (g) return g;
  const p = productSchema.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: p.error.issues[0].path.join('.') + ': ' + p.error.issues[0].message }, { status: 400 });
  const { sizes, ...f } = p.data;
  const db = supabaseAdmin();
  const { error } = await db.from('products').update({ ...f, code: f.code.toUpperCase(), slug: slugify(f.code) }).eq('id', params.id);
  if (error) return NextResponse.json({ error: error.code === '23505' ? 'Product code already exists' : 'Could not save' }, { status: 400 });
  // sync sizes: remove dropped ones, upsert the rest
  const keep = sizes.map((s) => s.size);
  const del = db.from('product_sizes').delete().eq('product_id', params.id);
  await (keep.length ? del.not('size', 'in', `(${keep.map((k) => `"${k}"`).join(',')})`) : del);
  if (sizes.length) await db.from('product_sizes').upsert(sizes.map((s, i) => ({ ...s, product_id: params.id, sort_order: i })), { onConflict: 'product_id,size' });
  return NextResponse.json({ ok: true });
}

// Default = deactivate (hide from shop, keeps order history). ?hard=1 deletes permanently.
export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const params = await ctx.params;
  const g = await guardApi(); if (g) return g;
  const db = supabaseAdmin();
  if (new URL(req.url).searchParams.get('hard') === '1') await db.from('products').delete().eq('id', params.id);
  else await db.from('products').update({ is_active: false }).eq('id', params.id);
  return NextResponse.json({ ok: true });
}
