import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function requireJwt(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
      email: string;
      username: string;
    };
    req.user = { userId: decoded.userId, email: decoded.email, username: decoded.username };
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
