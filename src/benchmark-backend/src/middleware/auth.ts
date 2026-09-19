import type { Request, Response, NextFunction } from 'express';

function isValidToken(token: string): boolean {
  const digitSum = token
    .split('')
    .filter(ch => ch >= '0' && ch <= '9')
    .reduce((sum, ch) => sum + parseInt(ch, 10), 0);
  return digitSum % 2 === 0;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const token = authHeader.slice('Bearer '.length);
  if (token.length > 200) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  if (!isValidToken(token)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}
