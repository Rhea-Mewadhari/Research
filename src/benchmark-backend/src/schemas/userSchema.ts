import { z } from 'zod';

export const updateUserSchema = z
  .object({
    username: z.string().min(1).optional(),
    email: z.string().email().optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8).optional(),
  })
  .superRefine((data, ctx) => {
    const hasRecognisedField =
      data.username !== undefined ||
      data.email !== undefined ||
      data.currentPassword !== undefined ||
      data.newPassword !== undefined;

    if (!hasRecognisedField) {
      ctx.addIssue({
        code: 'custom',
        message: 'At least one field must be provided',
      });
    }

    if (data.newPassword !== undefined && data.currentPassword === undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['currentPassword'],
        message: 'currentPassword is required when newPassword is provided',
      });
    }
  });
