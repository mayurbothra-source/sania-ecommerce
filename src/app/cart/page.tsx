'use client';
import Link from 'next/link';
import { useCart } from '@/lib/cart';
import { usePricedCart } from '@/lib/usePricedCart';
import { img, inr } from '@/lib/utils';
import OrderSummary from '@/components/OrderSummary';

export default function CartPage() {
  const { setQty, remove } = useCart();
  const { priced, loading } = usePricedCart();
  if (!priced) return <p className="p-10 text-center">Loading your cart…</p>;
  if (!priced.lines.length) return <div className="mx-auto max-w-md px-4 py-20 text-center"><h1 className="text-4xl">Your cart is empty</h1><Link href="/shop" className="btn-primary mt-6">Continue shopping</Link></div>;
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl">Your cart</h1>
      <div className="mt-6 grid gap-8 md:grid-cols-[1fr_360px]">
        <ul className="space-y-3">
          {priced.lines.map((l) => (
            <li key={l.productId + l.size} className="card flex gap-4">
              {l.image && <img src={img(l.image, 200)} alt="" className="h-28 w-20 rounded object-cover" />}
              <div className="flex-1 text-sm">
                <Link href={`/product/${l.slug}`} className="font-serif text-xl text-burgundy">{l.code}</Link>
                <p>{l.name} · Size {l.size}</p>
                <p className="mt-1">{inr(l.unitPrice)} each</p>
                {l.error && <p className="mt-1 text-rosedeep">{l.error}</p>}
                <div className="mt-2 flex items-center gap-4">
                  <div className="inline-flex items-center rounded border border-rose">
                    <button className="px-3 py-1" onClick={() => setQty(l.productId, l.size, l.qty - 1)} aria-label="Decrease">−</button>
                    <span className="w-6 text-center">{l.qty}</span>
                    <button className="px-3 py-1" onClick={() => setQty(l.productId, l.size, l.qty + 1)} aria-label="Increase">+</button>
                  </div>
                  <button className="text-xs underline" onClick={() => remove(l.productId, l.size)}>Remove</button>
                </div>
              </div>
              <p className="text-sm font-medium">{inr(l.lineTotal)}</p>
            </li>
          ))}
        </ul>
        <div className="space-y-4">
          <OrderSummary priced={priced} />
          {priced.ok ? <Link href="/checkout" className={`btn-primary w-full ${loading ? 'pointer-events-none opacity-60' : ''}`}>Proceed to Checkout</Link>
            : <p className="text-sm text-rosedeep">Please fix the highlighted items to continue.</p>}
        </div>
      </div>
    </div>
  );
}
