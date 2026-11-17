import { readFileSync } from 'fs';
import path from 'path';
import { supabasePublic } from './supabase';
import { PRODUCT_SELECT, hasDb } from './utils';
import type { Product } from './types';

const fileProducts = (): Product[] => JSON.parse(readFileSync(path.join(process.cwd(), 'data', 'products.json'), 'utf8'));

export async function getProducts(): Promise<Product[]> {
  if (!hasDb) return fileProducts().filter((p) => p.is_active).sort((a, b) => a.sort_order - b.sort_order);
  const { data } = await supabasePublic().from('products').select(PRODUCT_SELECT).eq('is_active', true).order('sort_order').order('created_at', { ascending: false });
  return (data as Product[]) || [];
}
export async function getProduct(slug: string): Promise<Product | null> {
  if (!hasDb) return fileProducts().find((p) => p.slug === slug && p.is_active) || null;
  const { data } = await supabasePublic().from('products').select(PRODUCT_SELECT).eq('slug', slug).eq('is_active', true).maybeSingle();
  return (data as Product) || null;
}
