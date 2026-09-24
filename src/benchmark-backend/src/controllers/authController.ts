import type { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser, getUserById } from '../services/authService';
import { updateUser } from '../services/userService';

export function register(req: Request, res: Response, next: NextFunction): void {
  try {
    const { email, username, password } = req.validated as {
      email: string;
      username: string;
      password: string;
    };
    const result = registerUser(email, username, password);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export function login(req: Request, res: Response, next: NextFunction): void {
  try {
    const { email, password } = req.validated as { email: string; password: string };
    const result = loginUser(email, password);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export function me(req: Request, res: Response, next: NextFunction): void {
  try {
    const user = getUserById(req.user.userId);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}

export function patchMe(req: Request, res: Response, next: NextFunction): void {
  try {
    const data = req.validated as {
      username?: string;
      email?: string;
      currentPassword?: string;
      newPassword?: string;
    };
    const result = updateUser(req.user.userId, data);
    res.status(200).json({ user: result });
  } catch (err) {
    next(err);
  }
}
