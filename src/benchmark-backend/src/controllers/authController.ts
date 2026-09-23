import type { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema } from '../schemas/authSchema';
import * as authService from '../services/authService';
import { ValidationError } from '../errors';

export async function registerUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    next(new ValidationError('Validation failed'));
    return;
  }
  const { email, username, password } = result.data;
  try {
    const { user, token } = authService.register(email, username, password);
    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
}

export async function loginUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    next(new ValidationError('Validation failed'));
    return;
  }
  const { email, password } = result.data;
  try {
    const { user, token } = authService.login(email, password);
    res.status(200).json({ user, token });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = authService.getById(req.user.userId);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}
