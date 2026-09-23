import type { Request, Response, NextFunction } from 'express';
import { updateUser } from '../services/userService';

export const updateMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const body = req.validated as {
    username?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  };
  try {
    const user = await updateUser(req.user!.userId, body);
    res.json({ user });
  } catch (err) {
    next(err);
  }
};
