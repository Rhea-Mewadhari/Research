import type { Request, Response, NextFunction } from 'express';
import * as userService from '../services/userService';
import type { UpdateUserInput } from '../schemas/userSchema';

export async function updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const payload = req.validated as UpdateUserInput;
    const user = await userService.updateUser(userId, payload);
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}
