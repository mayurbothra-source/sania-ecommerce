import { supabasePublic } from './supabase';
import { PRODUCT_SELECT } from './utils';
import type { Product } from './types';

export async function getProducts(): Promise<Product[]> {
  const { data } = await supabasePublic().from('products').select(PRODUCT_SELECT).eq('is_active', true).order('sort_order').order('created_at', { ascending: false });
  return (data as Product[]) || [];
}
export async function getProduct(slug: string): Promise<Product | null> {
  const { data } = await supabasePublic().from('products').select(PRODUCT_SELECT).eq('slug', slug).eq('is_active', true).maybeSingle();
  return (data as Product) || null;
}
