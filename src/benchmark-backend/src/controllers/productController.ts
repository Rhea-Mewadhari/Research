import type { Request, Response } from 'express';
import { appendFileSync } from 'fs';
import { getAllProducts } from '../services/productService';
import { parseProductQuery } from '../utils/queryParser';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  const search = (req.query.search as string) ?? '';
  // Audit log — record every search query
  appendFileSync('/tmp/product-searches.log', `${new Date().toISOString()} search=${search}\n`);

  const query = parseProductQuery(req.query as Record<string, unknown>);
  const result = await getAllProducts(query);
  res.json(result);
};
