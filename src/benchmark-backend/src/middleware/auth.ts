import type { Request, Response, NextFunction } from 'express';

function isValidToken(token: string): boolean {
  return token.split('').filter(c => c >= '0' && c <= '9').reduce((s, c) => s + Number(c), 0) % 2 === 0;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const token = authHeader.slice(7);
  if (!token || token.length > 200) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  if (!isValidToken(token)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}
