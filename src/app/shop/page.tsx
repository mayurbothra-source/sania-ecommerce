import type { Metadata } from 'next';
import Link from 'next/link';
import { getProducts } from '@/lib/data';
import ProductCard from '@/components/ProductCard';
import { SIZE_PRESETS } from '@/lib/types';
import { sellable, sizesOf } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Shop Cotton Kurtis', description: 'Browse SANIA long cotton kurtis: soft cotton, straight fit, 3/4 sleeves.' };

type SP = { size?: string; price?: string; stock?: string; sort?: string };
const ranges: Record<string, [number, number]> = { u500: [0, 500], '500-1000': [500, 1000], '1000-1500': [1000, 1500], o1500: [1500, 1e9] };

export default async function Shop(props: { searchParams: Promise<SP> }) {
  const q = await props.searchParams;
  let list = await getProducts();
  if (q.size) list = list.filter((p) => sizesOf(p).some((s) => s.enabled && s.size === q.size && s.stock > 0));
  if (q.price && ranges[q.price]) { const [a, b] = ranges[q.price]; list = list.filter((p) => p.price != null && p.price >= a && p.price < b); }
  if (q.stock === '1') list = list.filter(sellable);
  if (q.sort === 'low') list.sort((a, b) => (a.price ?? 1e9) - (b.price ?? 1e9));
  else if (q.sort === 'high') list.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
  else if (q.sort === 'new') list.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="eyebrow">Collection 01</p>
      <h1 className="text-4xl md:text-5xl">Long Cotton Kurtis</h1>
      {/* plain GET form: works without JavaScript */}
      <form className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <select name="size" defaultValue={q.size || ''} className="input"><option value="">Any size</option>{SIZE_PRESETS.map((s) => <option key={s}>{s}</option>)}</select>
        <select name="price" defaultValue={q.price || ''} className="input"><option value="">Any price</option><option value="u500">Under ₹500</option><option value="500-1000">₹500 – ₹1,000</option><option value="1000-1500">₹1,000 – ₹1,500</option><option value="o1500">Above ₹1,500</option></select>
        <select name="stock" defaultValue={q.stock || ''} className="input"><option value="">All products</option><option value="1">In stock only</option></select>
        <select name="sort" defaultValue={q.sort || ''} className="input"><option value="">Featured order</option><option value="new">Latest arrivals</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select>
        <div className="flex gap-2"><button className="btn-primary flex-1">Apply</button><Link href="/shop" className="btn-outline">Reset</Link></div>
      </form>
      {list.length === 0 ? <p className="mt-12 text-center">No products match these filters.</p> :
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{list.map((p) => <ProductCard key={p.id} p={p} />)}</div>}
    </div>
  );
}
