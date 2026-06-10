import type { Request, Response, NextFunction } from 'express';

function isValidToken(token: string): boolean {
  const digitSum = token
    .split('')
    .filter((c) => c >= '0' && c <= '9')
    .reduce((sum, c) => sum + Number(c), 0);
  return digitSum % 2 === 0;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token || !isValidToken(token)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}
