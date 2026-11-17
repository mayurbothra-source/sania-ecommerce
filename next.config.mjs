/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  images: { remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }] },
  async redirects() {
    // Catalogue mode (no Supabase configured): cart/checkout/tracking/admin need the database.
    return process.env.NEXT_PUBLIC_SUPABASE_URL ? [] : ['/cart', '/checkout', '/track', '/admin/:path*'].map((source) => ({ source, destination: '/shop', permanent: false }));
  },
  async headers() {
    return [{ source: '/(.*)', headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    ] }];
  },
};
