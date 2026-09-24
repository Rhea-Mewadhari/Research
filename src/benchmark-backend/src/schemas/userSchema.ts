import { z } from 'zod';

export const patchMeSchema = z
  .object({
    username: z.string().min(1).optional(),
    email: z.string().email().optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8).optional(),
  })
  .refine(
    (data) => data.username !== undefined || data.email !== undefined || data.newPassword !== undefined,
    { message: 'At least one field to update must be provided' },
  )
  .refine(
    (data) => !data.newPassword || data.currentPassword !== undefined,
    { message: 'currentPassword is required when setting a new password' },
  );
