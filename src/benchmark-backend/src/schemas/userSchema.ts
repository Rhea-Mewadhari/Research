import { z } from 'zod';

export const userSchema = z
  .object({
    username: z.string().optional(),
    email: z.string().optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.username && !data.email && !data.newPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one of username, email, or newPassword must be provided',
      });
    }
    if (data.newPassword && !data.currentPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'currentPassword is required when setting a new password',
      });
    }
  });

export type UserUpdateInput = z.infer<typeof userSchema>;
