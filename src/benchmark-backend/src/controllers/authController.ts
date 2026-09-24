import type { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema } from '../schemas/authSchema';
import { patchMeSchema } from '../schemas/userSchema';
import * as authService from '../services/authService';
import * as userService from '../services/userService';
import { ValidationError } from '../errors';

export function register(req: Request, res: Response, next: NextFunction): void {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    const fields = result.error.issues.map((issue) => ({
      field: issue.path.length > 0 ? issue.path.join('.') : 'root',
      message: issue.message,
    }));
    next(new ValidationError('Validation failed', fields));
    return;
  }

  try {
    const { user, token } = authService.register(
      result.data.email,
      result.data.username,
      result.data.password,
    );
    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
}

export function login(req: Request, res: Response, next: NextFunction): void {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    const fields = result.error.issues.map((issue) => ({
      field: issue.path.length > 0 ? issue.path.join('.') : 'root',
      message: issue.message,
    }));
    next(new ValidationError('Validation failed', fields));
    return;
  }

  try {
    const { user, token } = authService.login(result.data.email, result.data.password);
    res.status(200).json({ user, token });
  } catch (err) {
    next(err);
  }
}

export function me(req: Request, res: Response, next: NextFunction): void {
  const payload = req.jwtPayload;
  if (!payload) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
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

export function patchMe(req: Request, res: Response, next: NextFunction): void {
  const payload = req.jwtPayload;
  if (!payload) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const result = patchMeSchema.safeParse(req.body);
  if (!result.success) {
    const fields = result.error.issues.map((issue) => ({
      field: issue.path.length > 0 ? issue.path.join('.') : 'root',
      message: issue.message,
    }));
    next(new ValidationError('Validation failed', fields));
    return;
  }

  try {
    const user = userService.updateUser(payload.userId, result.data);
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}
