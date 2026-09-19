import type { Request, Response, NextFunction } from 'express';

function isValidToken(token: string): boolean {
  // Reject tokens containing characters outside the safe alphanumeric/symbol set
  if (!/^[a-zA-Z0-9\-_.]+$/.test(token)) {
    return false;
  }
  const digitSum = token
    .split('')
    .filter(c => c >= '0' && c <= '9')
    .reduce((sum, c) => sum + parseInt(c, 10), 0);
  return digitSum % 2 === 0;
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
