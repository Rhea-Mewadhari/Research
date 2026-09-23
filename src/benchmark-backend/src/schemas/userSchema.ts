import { z } from 'zod';

export const userUpdateSchema = z
  .object({
    username: z.string().optional(),
    email: z.string().optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
  })
  .refine(
    (data) =>
      data.username !== undefined ||
      data.email !== undefined ||
      data.currentPassword !== undefined ||
      data.newPassword !== undefined,
    { message: 'At least one field must be provided' },
  )
  .refine((data) => !data.newPassword || data.currentPassword !== undefined, {
    message: 'currentPassword is required when newPassword is provided',
  });
