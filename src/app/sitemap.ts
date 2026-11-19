import type { MetadataRoute } from 'next';
import { getProducts } from '@/lib/data';
export const dynamic = 'force-dynamic';
const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const ps = await getProducts().catch(() => []);
  return [{ url: site }, { url: `${site}/shop` }, ...ps.map((p) => ({ url: `${site}/product/${p.slug}` }))];
}
