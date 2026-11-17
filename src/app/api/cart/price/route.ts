import { NextResponse } from 'next/server';
import { z } from 'zod';
import { priceCart } from '@/lib/pricing';

const cartSchema = z.array(z.object({ productId: z.string().uuid(), size: z.string().min(1).max(10), qty: z.number().int().min(1).max(10) })).max(30);

export async function POST(req: Request) {
  const p = cartSchema.safeParse((await req.json().catch(() => ({}))).items);
  if (!p.success) return NextResponse.json({ error: 'Invalid cart' }, { status: 400 });
  if (!p.data.length) return NextResponse.json({ lines: [], subtotal: 0, shipping: 0, total: 0, ok: false });
  return NextResponse.json(await priceCart(p.data));
}
