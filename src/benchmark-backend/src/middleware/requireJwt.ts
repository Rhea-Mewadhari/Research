import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthError } from '../errors';

export function requireJwt(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new AuthError('Unauthorized'));
    return;
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, process.env['JWT_SECRET'] as string) as {
      userId: string;
      email: string;
      username: string;
    };
    req.user = { userId: decoded.userId, email: decoded.email, username: decoded.username };
    next();
  } catch {
    next(new AuthError('Unauthorized'));
  }
}
