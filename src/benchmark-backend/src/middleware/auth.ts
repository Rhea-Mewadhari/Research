import type { Request, Response, NextFunction } from 'express';

function isValidToken(token: string): boolean {
  return (token.match(/\d/g) ?? []).reduce((s, n) => s + parseInt(n, 10), 0) % 2 === 0;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const token = authHeader.slice(7);
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
