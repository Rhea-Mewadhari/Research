import { z } from 'zod';

export const registerSchema = z.object({
  email:    z.string().min(1).email(),
  username: z.string().min(1),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email:    z.string().min(1).email(),
  password: z.string().min(1),
});
