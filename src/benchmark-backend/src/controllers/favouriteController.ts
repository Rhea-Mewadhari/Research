import type { Request, Response, NextFunction } from 'express';
import {
  addFavourite,
  removeFavourite,
  getFavourites,
} from '../services/favouritesService';

export const list = (_req: Request, res: Response): void => {
  const favourites = getFavourites();
  res.json({ favourites, count: favourites.length });
};

export const add = (req: Request, res: Response, next: NextFunction): void => {
  const productId = req.validated['productId'] as string;
  try {
    const { favourite, created } = addFavourite(productId);
    res.status(created ? 201 : 200).json(favourite);
  } catch (err) {
    next(err);
  }
};

export const remove = (req: Request, res: Response): void => {
  const raw = req.params['productId'];
  const productId = typeof raw === 'string' ? raw : '';
  const removed = removeFavourite(productId);
  if (!removed) {
    res.status(404).json({ error: 'Favourite not found' });
    return;
  }
  res.status(204).send();
};
