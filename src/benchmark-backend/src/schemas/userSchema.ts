import { z } from 'zod';

export const updateUserSchema = z
  .object({
    username: z.string().optional(),
    email: z.string().optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.username && !data.email && !data.newPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'At least one of username, email, or newPassword must be provided',
      });
    }
    if (data.newPassword && !data.currentPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'currentPassword is required when newPassword is provided',
        path: ['currentPassword'],
      });
    }
  });
