import { products } from '../data/products';
import type { Product, ProductQuery } from '../types/product';

export function getAllProducts(_query: ProductQuery): Product[] {
  let result = [...products];

  // TODO (agent must implement):
  // - apply search filter (case-insensitive partial match, trim whitespace)
  // - apply category filter (case-insensitive exact match)
  // - apply inStock filter
  // - apply sorting (price_asc, price_desc, name_asc, name_desc)

  return result;
}
