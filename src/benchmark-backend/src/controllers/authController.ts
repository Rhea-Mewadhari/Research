import type { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser, getUserFromToken } from '../services/authService';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email, username, password } = req.validated as {
    email: string;
    username: string;
    password: string;
  };
  try {
    const result = await registerUser(email, username, password);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email, password } = req.validated as { email: string; password: string };
  try {
    const result = await loginUser(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const me = (req: Request, res: Response): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const user = getUserFromToken(token);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  res.json(user);
};
