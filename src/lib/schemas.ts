import { z } from 'zod';

export const productSchema = z.object({
  code: z.string().trim().min(2).max(30), name: z.string().trim().min(2).max(100),
  collection: z.string().max(80).default('Long Cotton Kurtis'),
  tagline: z.string().max(120).nullish(), description: z.string().max(2000).nullish(),
  fabric: z.string().max(80).nullish(), fit: z.string().max(80).nullish(), sleeve: z.string().max(80).nullish(),
  length: z.string().max(80).nullish(), colour: z.string().max(60).nullish(),
  mrp: z.number().min(0).nullish(), price: z.number().min(0).nullish(),
  is_active: z.boolean(), is_featured: z.boolean(), is_new: z.boolean(), out_of_stock: z.boolean(),
  sizes: z.array(z.object({ size: z.string().trim().min(1).max(10), stock: z.number().int().min(0).max(100000), enabled: z.boolean() })).max(15),
});
