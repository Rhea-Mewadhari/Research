import type { Request, Response, NextFunction } from 'express';
import { getProducts as queryProducts, getProductById } from '../services/productService';
import { getComparison } from '../services/compareService';
import { parseProductQuery } from '../utils/queryParser';
import { ValidationError, ProductNotFoundError } from '../errors';

export const getProducts = (req: Request, res: Response): void => {
  const query = parseProductQuery(req.query as Record<string, unknown>);
  const result = queryProducts(query);
  res.json(result);
};

export const getProductDetail = (req: Request, res: Response): void => {
  const raw = req.params['id'];
  const id = typeof raw === 'string' ? raw : '';
  if (!id || !/^\d+$/.test(id)) {
    res.status(400).json({ error: 'Invalid product id' });
    return;
  }
  const product = getProductById(id);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json(product);
};

export const getById = (req: Request, res: Response, next: NextFunction): void => {
  const id = req.validated['id'] as string;
  const product = getProductById(id);
  if (!product) {
    next(new ProductNotFoundError(id));
    return;
  }
  res.json(product);
};

export const getCompareProducts = (req: Request, res: Response): void => {
  const idsParam = typeof req.query.ids === 'string' ? req.query.ids : '';
  const ids = idsParam
    .split(',')
    .map((s) => s.trim())
    .filter((s) => /^\d+$/.test(s));
  try {
    const { products } = getComparison(ids);
    res.json(products);
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({ error: (err as Error).message });
      return;
    }
    throw err;
  }
};
