import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import { PRODUCT_SELECT } from '@/lib/utils';
import type { Product } from '@/lib/types';
import ProductForm from '../ProductForm';

export default async function EditProduct(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { data } = await supabaseAdmin().from('products').select(PRODUCT_SELECT).eq('id', params.id).maybeSingle();
  if (!data) notFound();
  return <><h1 className="text-3xl">Edit {(data as Product).code}</h1><ProductForm product={data as Product} /></>;
}
