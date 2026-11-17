import 'server-only';
import { supabaseAdmin } from './supabase';
import type { Product } from './types';

export type CartIn = { productId: string; size: string; qty: number };
export type Line = { productId: string; size: string; qty: number; code: string; name: string; slug: string; image: string; unitPrice: number; lineTotal: number; stock: number; error?: string };

export async function getShipping(subtotal: number) {
  const { data } = await supabaseAdmin().from('settings').select('*');
  const m = Object.fromEntries((data || []).map((r) => [r.key, Number(r.value)]));
  const charge = m.shipping_charge || 0, free = m.free_shipping_above || 0;
  return free > 0 && subtotal >= free ? 0 : charge;
}

/** All prices and stock come from the database. Nothing from the browser is trusted except ids/size/qty. */
export async function priceCart(items: CartIn[]) {
  const ids = [...new Set(items.map((i) => i.productId))];
  const { data } = await supabaseAdmin().from('products').select('*, product_sizes(*), product_images(*)').in('id', ids);
  const products = new Map((data as Product[] || []).map((p) => [p.id, p]));
  const lines: Line[] = items.map((it) => {
    const p = products.get(it.productId);
    const base = { ...it, code: p?.code || '', name: p?.name || 'Unavailable product', slug: p?.slug || '', unitPrice: 0, lineTotal: 0, stock: 0,
      image: [...(p?.product_images || [])].sort((a, b) => Number(b.is_main) - Number(a.is_main))[0]?.url || '' };
    if (!p || !p.is_active) return { ...base, error: 'This product is no longer available' };
    if (p.out_of_stock || p.price == null) return { ...base, error: 'Out of stock' };
    const s = (p.product_sizes || []).find((x) => x.size === it.size);
    if (!s || !s.enabled) return { ...base, error: `Size ${it.size} is not available` };
    const stock = s.stock;
    if (stock < 1) return { ...base, stock, error: `Size ${it.size} is sold out` };
    if (it.qty > stock) return { ...base, stock, unitPrice: Number(p.price), error: `Only ${stock} left in size ${it.size}` };
    return { ...base, stock, unitPrice: Number(p.price), lineTotal: Number(p.price) * it.qty };
  });
  const subtotal = lines.reduce((a, l) => a + l.lineTotal, 0);
  const shipping = lines.length ? await getShipping(subtotal) : 0;
  return { lines, subtotal, shipping, total: subtotal + shipping, ok: lines.length > 0 && lines.every((l) => !l.error) };
}
