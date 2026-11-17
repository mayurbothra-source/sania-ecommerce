import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProduct } from '@/lib/data';
import Gallery from '@/components/Gallery';
import ProductBuy from '@/components/ProductBuy';
import { discountPct, img, inr, mainImage, sellable, sizesOf, sortedImages } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await getProduct((await props.params).slug);
  if (!p) return {};
  return { title: `${p.code} ${p.name} Cotton Kurti`, description: p.description || undefined, openGraph: { images: mainImage(p) ? [img(mainImage(p), 800)] : [] } };
}

export default async function ProductPage(props: { params: Promise<{ slug: string }> }) {
  const p = await getProduct((await props.params).slug);
  if (!p) notFound();
  const off = discountPct(p);
  const specs = [['Fabric', p.fabric], ['Fit', p.fit], ['Sleeve', p.sleeve], ['Length', p.length], ['Colour', p.colour]].filter(([, v]) => v);
  const ld = { '@context': 'https://schema.org', '@type': 'Product', name: `${p.code} ${p.name}`, sku: p.code, description: p.description, image: sortedImages(p).map((i) => i.url),
    brand: { '@type': 'Brand', name: 'SANIA' }, ...(p.price != null && { offers: { '@type': 'Offer', priceCurrency: 'INR', price: p.price, availability: sellable(p) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' } }) };
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-2">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Gallery images={sortedImages(p)} alt={`${p.name} ${p.code}`} />
      <div>
        <p className="eyebrow">Product code</p>
        <h1 className="text-5xl">{p.code}</h1>
        <p className="mt-1 text-lg">{p.name}</p>
        {p.tagline && <p className="mt-2 font-script text-2xl text-mustard">{p.tagline}</p>}
        <p className="mt-4 text-2xl">
          {p.price != null ? <><span className="font-medium text-burgundy">{inr(p.price)}</span>{p.mrp && p.mrp > p.price && <><span className="ml-3 text-base text-[#2b2024]/50 line-through">{inr(p.mrp)}</span><span className="ml-2 text-sm text-rosedeep">{off}% off</span></>}</> : <span className="text-base text-[#2b2024]/60">Price coming soon</span>}
        </p>
        {p.description && <p className="mt-4 leading-relaxed">{p.description}</p>}
        <ProductBuy productId={p.id} code={p.code} sizes={sizesOf(p)} canBuy={sellable(p)} priceSet={p.price != null} />
        <dl className="mt-8 divide-y divide-rose/60 border-y border-rose/60">
          {specs.map(([k, v]) => <div key={k} className="flex justify-between py-2 text-sm"><dt className="uppercase tracking-wider text-burgundy/80">{k}</dt><dd>{v}</dd></div>)}
        </dl>
        {p.perfect_for.length > 0 && <div className="mt-6 flex flex-wrap items-center gap-2"><span className="label mb-0">Perfect for</span>{p.perfect_for.map((t) => <span key={t} className="rounded-full border border-burgundy px-3 py-1 text-xs text-burgundy">{t}</span>)}</div>}
      </div>
    </div>
  );
}
