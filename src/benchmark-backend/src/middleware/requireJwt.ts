import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  email: string;
  username: string;
}

declare global {
  namespace Express {
    interface Request {
      jwtPayload?: JwtPayload;
    }
  }
}

export function requireJwt(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const secret = process.env['JWT_SECRET'] ?? 'dev-secret';
    const payload = jwt.verify(token, secret) as JwtPayload;
    req.jwtPayload = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
