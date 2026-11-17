'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type CartItem = { productId: string; size: string; qty: number };
type Ctx = { items: CartItem[]; count: number; add: (i: CartItem) => void; setQty: (id: string, size: string, qty: number) => void; remove: (id: string, size: string) => void; clear: () => void; ready: boolean };
const C = createContext<Ctx>(null as never);
const KEY = 'sania_cart_v1';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => { try { setItems(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch {} setReady(true); }, []);
  useEffect(() => { if (ready) try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {} }, [items, ready]);
  const same = (a: CartItem, id: string, size: string) => a.productId === id && a.size === size;
  const value: Ctx = {
    items, ready, count: items.reduce((a, i) => a + i.qty, 0),
    add: (i) => setItems((p) => p.some((x) => same(x, i.productId, i.size)) ? p.map((x) => same(x, i.productId, i.size) ? { ...x, qty: Math.min(10, x.qty + i.qty) } : x) : [...p, i]),
    setQty: (id, size, qty) => setItems((p) => p.map((x) => same(x, id, size) ? { ...x, qty: Math.max(1, Math.min(10, qty)) } : x)),
    remove: (id, size) => setItems((p) => p.filter((x) => !same(x, id, size))),
    clear: () => setItems([]),
  };
  return <C.Provider value={value}>{children}</C.Provider>;
}
export const useCart = () => useContext(C);
