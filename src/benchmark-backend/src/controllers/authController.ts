import type { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';

export function register(req: Request, res: Response, next: NextFunction): void {
  try {
    const { email, username, password } = req.validated as {
      email: string;
      username: string;
      password: string;
    };
    const result = authService.register(email, username, password);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export function login(req: Request, res: Response, next: NextFunction): void {
  try {
    const { email, password } = req.validated as { email: string; password: string };
    const result = authService.login(email, password);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export function me(req: Request, res: Response, next: NextFunction): void {
  try {
    const payload = req.jwtPayload;
    if (!payload) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const user = authService.getById(payload.userId);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}
