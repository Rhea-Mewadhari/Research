import type { Request, Response, NextFunction } from 'express';
import { register, login, getById } from '../services/authService';

export const registerHandler = (req: Request, res: Response, next: NextFunction): void => {
  const { email, username, password } = req.validated as {
    email: string;
    username: string;
    password: string;
  };
  try {
    const result = register({ email, username, password });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const loginHandler = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password } = req.validated as { email: string; password: string };
  try {
    const result = login(email, password);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const meHandler = (req: Request, res: Response, next: NextFunction): void => {
  const { userId } = req.jwtUser!;
  try {
    const user = getById(userId);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};
