import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function requireJwt(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as { userId: string; email: string; username: string };
    req.jwtPayload = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
