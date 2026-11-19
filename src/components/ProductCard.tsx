import Link from 'next/link';
import type { Product } from '@/lib/types';
import { backImage, discountPct, img, inr, mainImage, sellable, sizesOf } from '@/lib/utils';

export default function ProductCard({ p }: { p: Product }) {
  const back = backImage(p), main = mainImage(p), off = discountPct(p);
  const sizes = sizesOf(p).filter((s) => s.enabled && s.stock > 0);
  const out = !sellable(p) && p.price != null;
  return (
    <Link href={`/product/${p.slug}`} className="group block">
      <div className="relative aspect-[2/5] overflow-hidden rounded bg-rose/30">
        {main && <img src={img(main, 600)} alt={`${p.name} kurti ${p.code}`} loading="lazy" className="h-full w-full object-cover object-top" />}
        {back && <img src={img(back, 600)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100" />}
        {out && <span className="absolute left-2 top-2 rounded bg-burgundy px-2 py-1 text-xs text-ivory">Out of stock</span>}
        {!out && p.is_new && <span className="absolute left-2 top-2 rounded bg-mustard px-2 py-1 text-xs text-white">New</span>}
        {off > 0 && <span className="absolute right-2 top-2 rounded bg-rosedeep px-2 py-1 text-xs text-white">{off}% off</span>}
      </div>
      <p className="mt-3 font-serif text-xl text-burgundy">{p.code}</p>
      <p className="text-sm text-[#2b2024]/80">{p.name}</p>
      <p className="mt-1 text-sm">
        {p.price != null ? <><span className="font-medium text-burgundy">{inr(p.price)}</span>{p.mrp && p.mrp > p.price && <span className="ml-2 text-[#2b2024]/50 line-through">{inr(p.mrp)}</span>}</> : <span className="text-[#2b2024]/60">Price coming soon</span>}
      </p>
      {sizes.length > 0 && <p className="mt-1 text-xs text-[#2b2024]/60">{sizes.map((s) => s.size).join(' · ')}</p>}
    </Link>
  );
}
