import type { Request, Response, NextFunction } from 'express';
import { userSchema } from '../schemas/userSchema';
import * as userService from '../services/userService';
import { ValidationError } from '../errors';

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  const result = userSchema.safeParse(req.body);
  if (!result.success) {
    next(new ValidationError('Validation failed'));
    return;
  }
  try {
    const user = await userService.updateUser(req.user.userId, result.data);
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}
