'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart';
import type { Size } from '@/lib/types';
import { hasDb, waLink } from '@/lib/utils';

export default function ProductBuy({ productId, code, sizes, canBuy, priceSet }: { productId: string; code: string; sizes: Size[]; canBuy: boolean; priceSet: boolean }) {
  const { add } = useCart();
  const router = useRouter();
  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState('');
  const cur = sizes.find((s) => s.size === size);
  const max = Math.min(10, cur?.stock || 1);

  if (!hasDb) return (
    <div className="mt-6">
      <a href={waLink(`Hi SANIA, I'd like to order ${code}`)} target="_blank" rel="noreferrer" className="btn-primary w-full">Order on WhatsApp</a>
      <p className="mt-2 text-xs text-[#2b2024]/60">Message us the product code {code} and we’ll confirm size, price and delivery.</p>
    </div>
  );
  if (!canBuy) return (
    <div className="mt-6">
      <p className="rounded bg-rose/40 p-3 text-sm">{priceSet ? 'Currently out of stock.' : 'Pricing coming soon.'} Message us and we’ll let you know.</p>
      <a href={waLink(`Hi SANIA, I'm interested in ${code}`)} target="_blank" rel="noreferrer" className="btn-outline mt-3 w-full">Ask on WhatsApp</a>
    </div>
  );
  const go = (buyNow: boolean) => {
    if (!size) { setMsg('Please select a size'); return; }
    add({ productId, size, qty }); setMsg('');
    if (buyNow) router.push('/checkout'); else setMsg('Added to cart ✓');
  };
  return (
    <div className="mt-6">
      <p className="label">Size</p>
      <div className="flex flex-wrap gap-2">
        {sizes.map((s) => {
          const off = !s.enabled || s.stock < 1;
          return <button key={s.id} type="button" disabled={off} onClick={() => { setSize(s.size); setQty(1); setMsg(''); }}
            className={`min-w-12 rounded border px-3 py-2 text-sm ${size === s.size ? 'border-burgundy bg-burgundy text-ivory' : 'border-rose bg-white'} ${off ? 'cursor-not-allowed text-[#2b2024]/30 line-through' : ''}`}>{s.size}</button>;
        })}
      </div>
      {cur && <p className="mt-2 text-sm text-[#2b2024]/70">{cur.stock <= 5 ? `Only ${cur.stock} left` : 'In stock'}</p>}
      <p className="label mt-5">Quantity</p>
      <div className="inline-flex items-center rounded border border-rose bg-white">
        <button type="button" className="px-4 py-2" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease">−</button>
        <span className="w-8 text-center">{qty}</span>
        <button type="button" className="px-4 py-2" onClick={() => setQty(Math.min(max, qty + 1))} aria-label="Increase">+</button>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button className="btn-outline" onClick={() => go(false)}>Add to Cart</button>
        <button className="btn-primary" onClick={() => go(true)}>Buy Now</button>
      </div>
      {msg && <p className="mt-3 text-sm text-burgundy" role="status">{msg}</p>}
    </div>
  );
}
