import { z } from 'zod';

export const patchMeSchema = z
  .object({
    username:        z.string().min(1).optional(),
    email:           z.string().email().optional(),
    currentPassword: z.string().min(1).optional(),
    newPassword:     z.string().min(8).optional(),
  })
  .refine(
    (data) =>
      data.username !== undefined ||
      data.email !== undefined ||
      data.newPassword !== undefined,
    { message: 'At least one field must be provided' },
  );
