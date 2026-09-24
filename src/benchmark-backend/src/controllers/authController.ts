import type { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import { AppError } from '../errors';

export const registerHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, username, password } = req.validated as { email: string; username: string; password: string };
    const result = await authService.register(email, username, password);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const loginHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.validated as { email: string; password: string };
    const result = await authService.login(email, password);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const meHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.jwtPayload?.userId;
    if (!userId) {
      next(new AppError('Unauthorized', 401, 'AUTH_ERROR'));
      return;
    }
    const user = authService.getById(userId);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};
