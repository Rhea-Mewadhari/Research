import type { Request, Response, NextFunction } from 'express';
import * as userService from '../services/userService';
import type { UpdateUserFields } from '../services/userService';

export function patchMe(req: Request, res: Response, next: NextFunction): void {
  try {
    const userId = req.jwtPayload?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const fields = req.validated as UpdateUserFields;
    const user = userService.updateUser(userId, fields);
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}
