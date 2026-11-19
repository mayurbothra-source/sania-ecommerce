import 'server-only';
import type { Product, Size } from './types';
import { slugify } from './utils';

/** Google Sheet (Apps Script Web App) backend. Enabled when SHEET_URL is set. Server-only env vars. */
export const sheetMode = () => !!process.env.SHEET_URL;

type Row = { sku: string; name: string; category: string; price: number | null; image: string; sizes: Record<string, number | null>; active: boolean };
const ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

/** Google Drive share links -> direct image URL. Other URLs pass through. */
export function normalizeImage(url: string) {
  const m = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]+)/);
  return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w1200` : url;
}

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
  const img = r.image ? normalizeImage(r.image) : '';
  return {
    ...(base || { fabric: null, fit: null, sleeve: null, length: null, colour: null, colour_hex: null, tagline: null, description: null, perfect_for: [], mrp: null, is_featured: false, is_new: false, out_of_stock: false, created_at: new Date(2026, 0, 1 + i).toISOString() }),
    id: r.sku, code: r.sku, slug: slugify(r.sku), name: r.name || base?.name || r.sku, collection: r.category || 'Long Cotton Kurtis',
    price: r.price, is_active: r.active, sort_order: i, product_sizes: sizes,
    product_images: img ? [{ id: `${r.sku}-img`, product_id: r.sku, url: img, kind: 'front', is_main: true, sort_order: 0 }] : (base?.product_images || []),
  } as Product;
}
