import { z } from 'zod';

export const updateUserSchema = z
  .object({
    username: z.string().optional(),
    email: z.string().optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.username === undefined &&
      data.email === undefined &&
      data.currentPassword === undefined &&
      data.newPassword === undefined
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one field must be provided',
      });
    }
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== undefined && data.currentPassword === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'currentPassword is required when newPassword is provided',
      });
    }
  });

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
