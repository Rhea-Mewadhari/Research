import type { Request, Response } from 'express';
import { getAllProducts } from '../services/productService';
import { parseProductQuery } from '../utils/queryParser';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  const query = parseProductQuery(req.query as Record<string, unknown>);
  const result = await getAllProducts(query);
  res.json(result);
};
