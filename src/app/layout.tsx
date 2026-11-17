import type { Metadata } from 'next';
import { Cormorant_Garamond, DM_Sans, Caveat } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/lib/cart';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';

const serif = Cormorant_Garamond({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-serif' });
const sans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' });
const script = Caveat({ subsets: ['latin'], variable: '--font-script' });
const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: { default: 'SANIA — Cotton Kurtis | Pretty, comfy & easy on the pocket', template: '%s | SANIA' },
  description: 'SANIA: affordable, comfortable everyday cotton kurtis for women. Soft cotton, easy cuts and prints you will reach for again and again.',
  openGraph: { siteName: 'SANIA', type: 'website' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${script.variable}`}>
      <body><CartProvider><Header /><main>{children}</main><Footer /><WhatsAppButton /></CartProvider></body>
    </html>
  );
}
