import type { Request, Response } from "express";
import { getAllProducts } from "../services/productService";

export const getProducts = (req: Request, res: Response) => {
  const result = getAllProducts(req.query);
  res.json(result);
};