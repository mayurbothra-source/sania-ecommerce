/**
 * SKU -> bundled photo files in /public/products (exact filenames). Front first (main), then back.
 * Used for products coming from the Google Sheet. The sheet's "Image URL" column is ignored for now.
 */
export const productImages: Record<string, string[]> = {
  'SAN-01': ['/products/san-01-front.webp', '/products/san-01-back.webp'],
  'SAN-02': ['/products/san-02-front.webp', '/products/san-02-back.webp'],
  'SAN-03': ['/products/san-03-front.webp', '/products/san-03-back.webp'],
  'SAN-04': ['/products/san-04-front.webp', '/products/san-04-back.webp'],
  'SAN-05': ['/products/san-05-front.webp', '/products/san-05-back.webp'],
  'SAN-06': ['/products/san-06-front.webp', '/products/san-06-back.webp'],
  'SAN-07': ['/products/san-07-front.webp', '/products/san-07-back.webp'],
};
