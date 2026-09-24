import { z } from 'zod';

export const updateUserSchema = z
  .object({
    username: z.string().optional(),
    email: z.string().email().optional(),
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
  .refine(
    (data) => !(data.newPassword !== undefined && data.currentPassword === undefined),
    { message: 'currentPassword is required when newPassword is provided' },
  );
