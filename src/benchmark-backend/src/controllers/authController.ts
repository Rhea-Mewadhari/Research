import type { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import { ConflictError } from '../errors';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, username, password } = req.validated as {
      email: string;
      username: string;
      password: string;
    };
    const result = await authService.register(email, username, password);
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof Error && err.message.includes('UNIQUE constraint failed: users.email')) {
      next(new ConflictError('Email already registered'));
    } else if (err instanceof Error && err.message.includes('UNIQUE constraint failed: users.username')) {
      next(new ConflictError('Username already taken'));
    } else {
      next(err);
    }
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.validated as { email: string; password: string };
    const result = await authService.login(email, password);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = authService.getById(req.jwtUser!.userId);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}
