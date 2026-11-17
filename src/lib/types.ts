export type Size = { id: string; product_id: string; size: string; stock: number; enabled: boolean; sort_order: number };
export type Img = { id: string; product_id: string; url: string; kind: 'front' | 'back' | 'gallery'; is_main: boolean; sort_order: number };
export type Product = {
  id: string; code: string; slug: string; name: string; collection: string; tagline: string | null; description: string | null;
  fabric: string | null; fit: string | null; sleeve: string | null; length: string | null; colour: string | null; colour_hex: string | null;
  perfect_for: string[]; mrp: number | null; price: number | null;
  is_active: boolean; is_featured: boolean; is_new: boolean; out_of_stock: boolean; sort_order: number; created_at: string;
  product_sizes?: Size[]; product_images?: Img[];
};
export const ORDER_STATUSES = ['Order Placed', 'Payment Confirmed', 'Processing', 'Dispatched', 'Delivered', 'Cancelled'] as const;
export const SIZE_PRESETS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
