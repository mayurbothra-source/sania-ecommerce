import type { Img, Product } from './types';
export const inr = (n: number | null | undefined) => (n == null ? '' : '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 }));
/** Orders, stock and admin need Supabase. Without it the site runs as a catalogue (products from data/products.json, orders via WhatsApp). */
export const hasDb = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
export const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';
export const INSTAGRAM = process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE || '';
export const waLink = (text = 'Hi SANIA!') => WHATSAPP ? `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}` : '#';

/** Cloudinary URLs get automatic format/quality/width; local URLs pass through. */
export function img(url: string, w = 800) {
  const m = url.match(/^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.*)$/);
  return m ? `${m[1]}f_auto,q_auto,w_${w}/${m[2]}` : url;
}
export const sortedImages = (p: Product): Img[] =>
  [...(p.product_images || [])].sort((a, b) => Number(b.is_main) - Number(a.is_main) || a.sort_order - b.sort_order);
export const mainImage = (p: Product) => sortedImages(p)[0]?.url || '';
export const backImage = (p: Product) => (p.product_images || []).find((i) => i.kind === 'back')?.url;
export const sizesOf = (p: Product) => [...(p.product_sizes || [])].sort((a, b) => a.sort_order - b.sort_order);
export const sellable = (p: Product) => p.price != null && !p.out_of_stock && sizesOf(p).some((s) => s.enabled && s.stock > 0);
export const discountPct = (p: Product) => (p.mrp && p.price && p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0);
export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const PRODUCT_SELECT = '*, product_sizes(*), product_images(*)';
