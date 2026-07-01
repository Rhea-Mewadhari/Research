import type { Request, Response } from 'express';
import { getAllProducts, getProductById, getProductsByIds } from '../services/productService';
import { parseProductQuery } from '../utils/queryParser';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  const query = parseProductQuery(req.query as Record<string, unknown>);
  const result = await getAllProducts(query);
  res.json(result);
};

export const getProductDetail = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid product id' });
    return;
  }
  const product = await getProductById(id);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json(product);
};

export const getCompareProducts = async (req: Request, res: Response): Promise<void> => {
  const idsParam = typeof req.query.ids === 'string' ? req.query.ids : '';
  const ids = idsParam
    .split(',')
    .map((s) => parseInt(s, 10))
    .filter((n) => !isNaN(n) && n > 0);
  const products = await getProductsByIds(ids);
  res.json(products);
};
