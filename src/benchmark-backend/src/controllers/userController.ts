import type { Request, Response, NextFunction } from 'express';
import * as userService from '../services/userService';

export async function updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.jwtUser!.userId;
    const payload = req.validated as {
      username?: string;
      email?: string;
      currentPassword?: string;
      newPassword?: string;
    };
    const user = await userService.updateUser(userId, payload);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}
