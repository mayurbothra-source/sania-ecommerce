'use client';
import { useEffect, useState } from 'react';
import { useCart } from './cart';

export type PLine = { productId: string; size: string; qty: number; code: string; name: string; slug: string; image: string; unitPrice: number; lineTotal: number; stock: number; error?: string };
export type Priced = { lines: PLine[]; subtotal: number; shipping: number; total: number; ok: boolean };

/** Fetches server-calculated prices/stock for the cart. The browser never computes totals. */
export function usePricedCart() {
  const { items, ready } = useCart();
  const [priced, setPriced] = useState<Priced | null>(null);
  const [loading, setLoading] = useState(true);
  const key = JSON.stringify(items);
  useEffect(() => {
    if (!ready) return;
    if (!items.length) { setPriced({ lines: [], subtotal: 0, shipping: 0, total: 0, ok: false }); setLoading(false); return; }
    setLoading(true);
    const ctl = new AbortController();
    fetch('/api/cart/price', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items }), signal: ctl.signal })
      .then((r) => r.json()).then((d) => { if (d.lines) setPriced(d); setLoading(false); }).catch(() => {});
    return () => ctl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ready]);
  return { priced, loading };
}
