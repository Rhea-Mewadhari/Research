import { z } from 'zod';

export const addFavouriteSchema = z.object({
  productId: z.string().min(1).max(100),
});
