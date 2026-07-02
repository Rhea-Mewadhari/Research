import { z } from 'zod';

export const productQuerySchema = z.object({
  page:     z.coerce.number().int().min(1).default(1),
  limit:    z.coerce.number().int().min(1).max(50).default(10),
  search:   z.string().optional(),
  category: z.string().optional(),
  inStock:  z.coerce.boolean().optional(),
  featured: z.coerce.boolean().optional(),
  sortBy:   z.enum(['price-asc', 'price-desc', 'rating-desc', 'name-asc', 'rating_desc']).optional(),
});

export const productIdSchema = z.object({
  id: z.string().min(1).max(100),
});

export const compareQuerySchema = z.object({
  ids: z
    .string()
    .transform((s) => s.split(',').map((id) => id.trim()))
    .pipe(z.array(z.string().min(1)).min(2).max(3)),
});
