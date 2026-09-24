import type { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';

export const registerHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, username, password } = req.validated as {
      email: string;
      username: string;
      password: string;
    };
    const result = await authService.register(email, username, password);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const loginHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.validated as { email: string; password: string };
    const result = await authService.login(email, password);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const meHandler = async (
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
    const user = authService.getById(userId);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};
