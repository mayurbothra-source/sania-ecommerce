import Link from 'next/link';
import Logo from './Logo';
import { INSTAGRAM, waLink } from '@/lib/utils';

export default function Footer() {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  return (
    <footer className="mt-20 bg-burgundy text-ivory">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div><Logo light /><p className="mt-3 font-script text-xl text-mustard">Pretty, comfy &amp; easy on the pocket.</p></div>
        <div className="space-y-2 text-sm">
          <p className="eyebrow">Explore</p>
          <Link className="block" href="/shop">Shop all kurtis</Link><Link className="block" href="/track">Track your order</Link>
        </div>
        <div className="space-y-2 text-sm">
          <p className="eyebrow">Contact</p>
          <a className="block" href={waLink()} target="_blank" rel="noreferrer">WhatsApp us</a>
          {INSTAGRAM && <a className="block" href={`https://instagram.com/${INSTAGRAM}`} target="_blank" rel="noreferrer">Instagram @{INSTAGRAM}</a>}
          {email && <a className="block" href={`mailto:${email}`}>{email}</a>}
        </div>
      </div>
      <p className="border-t border-ivory/20 py-4 text-center text-xs text-ivory/70">© {new Date().getFullYear()} SANIA — Comfort, Style and Affordability for Every Woman.</p>
    </footer>
  );
}
