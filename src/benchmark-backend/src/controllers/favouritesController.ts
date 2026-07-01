import type { Request, Response } from 'express';
import { addFavourite, removeFavourite } from '../services/favouritesService';

export const postFavourite = (req: Request, res: Response): void => {
  const body = req.body as { productId?: unknown };
  if (!body.productId || typeof body.productId !== 'string') {
    res.status(400).json({ error: 'productId is required' });
    return;
  }
  addFavourite(body.productId);
  res.json({ ok: true });
};

export const deleteFavourite = (req: Request, res: Response): void => {
  removeFavourite(String(req.params.id));
  res.json({ ok: true });
};
