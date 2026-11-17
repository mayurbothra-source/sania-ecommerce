'use client';
import Link from 'next/link';
import { useState } from 'react';
import Logo from './Logo';
import { useCart } from '@/lib/cart';
import { hasDb } from '@/lib/utils';

const nav = [['/shop', 'Shop'], ['/#about', 'About'], ...(hasDb ? [['/track', 'Track order']] : [])];
export default function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b border-rose/60 bg-ivory/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/"><Logo /></Link>
        <nav className="hidden gap-8 text-sm md:flex">
          {nav.map(([h, l]) => <Link key={h} href={h} className="text-burgundy hover:text-mustard">{l}</Link>)}
        </nav>
        <div className="flex items-center gap-3">
          {hasDb && <Link href="/cart" className="relative rounded border border-burgundy px-3 py-1.5 text-sm text-burgundy" aria-label="Cart">
            Cart{count > 0 && <span className="ml-2 rounded-full bg-burgundy px-1.5 py-0.5 text-xs text-ivory">{count}</span>}
          </Link>}
          <button className="md:hidden text-burgundy" onClick={() => setOpen(!open)} aria-label="Menu">☰</button>
        </div>
      </div>
      {open && <nav className="flex flex-col gap-3 border-t border-rose/60 px-4 py-3 text-sm md:hidden">
        {nav.map(([h, l]) => <Link key={h} href={h} onClick={() => setOpen(false)} className="text-burgundy">{l}</Link>)}
      </nav>}
    </header>
  );
}
