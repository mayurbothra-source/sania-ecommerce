import Link from 'next/link';
import { getProducts } from '@/lib/data';
import { supabasePublic } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import { mainImage, img, hasDb } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const why = [['Budget-friendly fashion', 'Attractive kurtis that give you real value for money.'], ['Comfortable cotton', 'Soft, breathable and easy to look after, day after day.'],
  ['Everyday versatility', 'Styled for college, work, brunch or a family function.'], ['Fashion for everyone', 'Made for every woman, whatever her age or budget.']];

export default async function Home() {
  const products = await getProducts();
  const { data: reviews } = hasDb ? await supabasePublic().from('testimonials').select('*').eq('is_active', true).order('sort_order') : { data: [] };
  const featured = products.filter((p) => p.is_featured).slice(0, 4);
  const fresh = products.filter((p) => p.is_new).slice(0, 4);
  const hero = products.slice(0, 3);
  return (
    <>
      <section className="bg-burgundy text-ivory">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-2 md:py-20">
          <div>
            <p className="eyebrow">The Everyday Collection</p>
            <h1 className="mt-3 font-serif text-5xl leading-tight text-ivory md:text-6xl">Everyday fashion that feels like you.</h1>
            <p className="mt-4 font-script text-3xl text-mustard">Pretty, comfy &amp; easy on the pocket.</p>
            <Link href="/shop" className="btn mt-8 bg-ivory text-burgundy hover:bg-white">Shop Now</Link>
          </div>
          <div className="flex justify-center gap-3">
            {hero.map((p, i) => (
              <div key={p.id} className={`w-1/3 overflow-hidden rounded-t-full bg-ivory ${i === 1 ? 'mt-0' : 'mt-8'}`}>
                <img src={img(mainImage(p), 400)} alt={p.name} className="aspect-[2/5] w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {featured.length > 0 && <Section title="Featured" eyebrow="Pick your favourite" items={featured} />}
      {fresh.length > 0 && <Section title="New arrivals" eyebrow="Just in" items={fresh} />}

      <section id="about" className="mx-auto mt-20 max-w-3xl px-4 text-center">
        <p className="font-script text-3xl text-mustard">Hello, you!</p>
        <h2 className="mt-1 text-4xl">Made for the way you actually live</h2>
        <p className="mt-4 text-lg leading-relaxed">SANIA is a women’s ethnic wear label made for college mornings, office days, market runs and family dinners. Soft cotton, easy cuts and prints you’ll reach for again and again.</p>
      </section>

      <section className="mx-auto mt-14 grid max-w-6xl gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4">
        {why.map(([t, d]) => <div key={t} className="card"><h3 className="text-xl">{t}</h3><p className="mt-1 text-sm">{d}</p></div>)}
      </section>

      {reviews && reviews.length > 0 && (
        <section className="mx-auto mt-20 max-w-6xl px-4">
          <h2 className="text-center text-4xl">What our customers say</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {reviews.map((r) => <figure key={r.id} className="card"><blockquote className="italic">“{r.quote}”</blockquote><figcaption className="mt-3 text-sm text-burgundy">— {r.name}{r.city ? `, ${r.city}` : ''}</figcaption></figure>)}
          </div>
        </section>
      )}
    </>
  );
}

function Section({ title, eyebrow, items }: { title: string; eyebrow: string; items: Awaited<ReturnType<typeof getProducts>> }) {
  return (
    <section className="mx-auto mt-16 max-w-6xl px-4">
      <p className="eyebrow">{eyebrow}</p>
      <div className="flex items-end justify-between"><h2 className="text-4xl">{title}</h2><Link href="/shop" className="text-sm text-burgundy underline">View all</Link></div>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">{items.map((p) => <ProductCard key={p.id} p={p} />)}</div>
    </section>
  );
}
