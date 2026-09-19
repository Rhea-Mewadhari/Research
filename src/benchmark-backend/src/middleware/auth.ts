import type { Request, Response, NextFunction } from 'express';

function isValidToken(token: string): boolean {
  if (token.length > 200) return false;
  if (!/^[a-zA-Z0-9\-]*$/.test(token)) return false;
  let digitSum = 0;
  for (const ch of token) {
    const d = parseInt(ch, 10);
    if (!isNaN(d)) digitSum += d;
  }
  return digitSum % 2 === 0;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const spaceIndex = authHeader.indexOf(' ');
  const prefix = spaceIndex === -1 ? authHeader : authHeader.slice(0, spaceIndex);
  const token = spaceIndex === -1 ? '' : authHeader.slice(spaceIndex + 1);
  if (prefix !== 'Bearer' || !token || !isValidToken(token)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}
