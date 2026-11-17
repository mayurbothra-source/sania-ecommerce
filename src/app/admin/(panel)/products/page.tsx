import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { PRODUCT_SELECT, inr, mainImage, img } from '@/lib/utils';
import type { Product } from '@/lib/types';

export default async function Products() {
  const { data } = await supabaseAdmin().from('products').select(PRODUCT_SELECT).order('sort_order');
  const list = (data as Product[]) || [];
  return (
    <div>
      <div className="flex items-center justify-between"><h1 className="text-3xl">Products</h1><Link href="/admin/products/new" className="btn-primary">+ Add product</Link></div>
      <ul className="mt-4 space-y-2">
        {list.map((p) => (
          <li key={p.id}><Link href={`/admin/products/${p.id}`} className="card flex items-center gap-4 hover:border-burgundy">
            {mainImage(p) && <img src={img(mainImage(p), 120)} alt="" className="h-16 w-12 rounded object-cover" />}
            <div className="flex-1 text-sm"><p className="font-serif text-xl text-burgundy">{p.code} · {p.name}</p>
              <p>{p.price != null ? inr(p.price) : <span className="text-rosedeep">No price set</span>} · {(p.product_sizes || []).length ? (p.product_sizes || []).map((s) => `${s.size}:${s.stock}`).join(' ') : <span className="text-rosedeep">No sizes set</span>}</p></div>
            <div className="space-x-1 text-xs">{!p.is_active && <span className="rounded bg-rose px-2 py-1">Hidden</span>}{p.out_of_stock && <span className="rounded bg-rose px-2 py-1">Out of stock</span>}{p.is_featured && <span className="rounded bg-mustard/30 px-2 py-1">Featured</span>}{p.is_new && <span className="rounded bg-mustard/30 px-2 py-1">New</span>}</div>
          </Link></li>
        ))}
      </ul>
    </div>
  );
}
