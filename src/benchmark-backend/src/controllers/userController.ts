import type { Request, Response, NextFunction } from 'express';
import * as userService from '../services/userService';

export const updateMeHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.jwtPayload?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const updates = req.validated as {
      username?: string;
      email?: string;
      currentPassword?: string;
      newPassword?: string;
    };
    const user = await userService.updateUser(userId, updates);
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};
