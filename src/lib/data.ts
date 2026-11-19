import { readFileSync } from 'fs';
import path from 'path';
import { supabasePublic } from './supabase';
import { PRODUCT_SELECT, hasDb } from './utils';
import type { Product } from './types';
import { fetchSheetRows, rowToProduct, sheetMode } from './sheet';

const fileProducts = (): Product[] => JSON.parse(readFileSync(path.join(process.cwd(), 'data', 'products.json'), 'utf8'));

/** Sheet = source of truth for name, price, image, stock and Active. Descriptions/specs come from data/products.json when the SKU matches. */
async function sheetProducts(): Promise<Product[]> {
  try {
    const base = new Map(fileProducts().map((p) => [p.code, p]));
    return (await fetchSheetRows()).map((r, i) => rowToProduct(r, i, base.get(r.sku))).filter((p) => p.is_active);
  } catch (e) { console.error('Sheet fetch failed, showing bundled catalogue', e); return fileProducts().filter((p) => p.is_active); }
}

export async function getProducts(): Promise<Product[]> {
  if (sheetMode()) return sheetProducts();
  if (!hasDb) return fileProducts().filter((p) => p.is_active).sort((a, b) => a.sort_order - b.sort_order);
  const { data } = await supabasePublic().from('products').select(PRODUCT_SELECT).eq('is_active', true).order('sort_order').order('created_at', { ascending: false });
  return (data as Product[]) || [];
}
export async function getProduct(slug: string): Promise<Product | null> {
  if (sheetMode()) return (await sheetProducts()).find((p) => p.slug === slug) || null;
  if (!hasDb) return fileProducts().find((p) => p.slug === slug && p.is_active) || null;
  const { data } = await supabasePublic().from('products').select(PRODUCT_SELECT).eq('slug', slug).eq('is_active', true).maybeSingle();
  return (data as Product) || null;
}
