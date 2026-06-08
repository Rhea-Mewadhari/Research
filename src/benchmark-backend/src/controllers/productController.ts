import type { Request, Response } from 'express';
import { getAllProducts } from '../services/productService';
import { parseProductQuery } from '../utils/queryParser';

export const getProducts = (req: Request, res: Response): void => {
  const query = parseProductQuery(req.query as Record<string, unknown>);
  const result = getAllProducts(query);
  res.json(result);
};
