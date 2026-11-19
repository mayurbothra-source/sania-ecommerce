import 'server-only';
import type { Product, Size } from './types';
import { slugify } from './utils';
import { productImages } from './productImages';

/** Google Sheet (Apps Script Web App) backend. Enabled when SHEET_URL is set. Server-only env vars. */
export const sheetMode = () => !!process.env.SHEET_URL;

type Row = { sku: string; name: string; category: string; price: number | null; image: string; sizes: Record<string, number | null>; active: boolean };
const ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

/** Fresh read on every call: no caching anywhere. */
export async function fetchSheetRows(): Promise<Row[]> {
  const r = await fetch(process.env.SHEET_URL!, { cache: 'no-store', signal: AbortSignal.timeout(10000) });
  const j = await r.json();
  if (!j.ok) throw new Error(j.error || 'Sheet error');
  return j.products as Row[];
}

export function rowToProduct(r: Row, i: number, base?: Product): Product {
  const sizes: Size[] = ORDER.filter((s) => r.sizes[s] !== null && r.sizes[s] !== undefined)
    .map((s, n) => ({ id: `${r.sku}-${s}`, product_id: r.sku, size: s, stock: Math.max(0, Number(r.sizes[s]) || 0), enabled: true, sort_order: n }));
  // Photos come from the local SKU mapping; the sheet's Image URL column is deliberately ignored.
  const files = productImages[r.sku.toUpperCase()] || [];
  return {
    ...(base || { fabric: null, fit: null, sleeve: null, length: null, colour: null, colour_hex: null, tagline: null, description: null, perfect_for: [], mrp: null, is_featured: false, is_new: false, out_of_stock: false, created_at: new Date(2026, 0, 1 + i).toISOString() }),
    id: r.sku, code: r.sku, slug: slugify(r.sku), name: r.name || base?.name || r.sku, collection: r.category || 'Long Cotton Kurtis',
    price: r.price, is_active: r.active, sort_order: i, product_sizes: sizes,
    product_images: files.map((url, n) => ({ id: `${r.sku}-img${n}`, product_id: r.sku, url, kind: n === 0 ? 'front' as const : 'back' as const, is_main: n === 0, sort_order: n })),
  } as Product;
}
