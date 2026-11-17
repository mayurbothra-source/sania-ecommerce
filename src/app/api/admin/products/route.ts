import { NextResponse } from 'next/server';
import { z } from 'zod';
import { guardApi } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase';
import { slugify } from '@/lib/utils';
import { productSchema } from '@/lib/schemas';


export async function POST(req: Request) {
  const g = await guardApi(); if (g) return g;
  const p = productSchema.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: p.error.issues[0].path.join('.') + ': ' + p.error.issues[0].message }, { status: 400 });
  const { sizes, ...f } = p.data;
  const db = supabaseAdmin();
  const { data, error } = await db.from('products').insert({ ...f, code: f.code.toUpperCase(), slug: slugify(f.code) }).select('id').single();
  if (error || !data) return NextResponse.json({ error: error?.code === '23505' ? 'Product code already exists' : 'Could not create product' }, { status: 400 });
  if (sizes.length) await db.from('product_sizes').insert(sizes.map((s, i) => ({ ...s, product_id: data.id, sort_order: i })));
  return NextResponse.json({ id: data.id });
}
