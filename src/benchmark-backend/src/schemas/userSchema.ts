import { z } from 'zod';

export const patchMeSchema = z
  .object({
    username: z.string().min(1).optional(),
    email: z.string().email().optional(),
    currentPassword: z.string().min(1).optional(),
    newPassword: z.string().min(8).optional(),
  })
  .superRefine((data, ctx) => {
    const hasUpdate = data.username !== undefined || data.email !== undefined || data.newPassword !== undefined;
    if (!hasUpdate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one field must be provided',
        path: [],
      });
    }

    if (data.newPassword !== undefined && data.currentPassword === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'currentPassword is required when newPassword is provided',
        path: ['currentPassword'],
      });
    }
  });

export type PatchMeBody = z.infer<typeof patchMeSchema>;
