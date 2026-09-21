import type { Request, Response, NextFunction } from 'express';
import { getComparison } from '../services/compareService';

export const compare = (req: Request, res: Response, next: NextFunction): void => {
  const ids = req.validated['ids'] as string[];
  try {
    const result = getComparison(ids);
    res.json(result);
  } catch (_err) {
    next(_err);
  }
};
