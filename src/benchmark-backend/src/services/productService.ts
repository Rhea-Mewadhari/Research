import { fetchAllProducts } from './dataFetcher';
import type { Product, ProductQuery, PaginatedResponse } from '../types/product';

export async function getProductById(id: number): Promise<Product | undefined> {
  const products = await fetchAllProducts();
  return products.find((p) => p.id === id);
}

export async function getProductsByIds(ids: number[]): Promise<Product[]> {
  const products = await fetchAllProducts();
  return ids
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => p !== undefined);
}

export async function getAllProducts(query: ProductQuery): Promise<PaginatedResponse<Product>> {
  const products = await fetchAllProducts();
  let result = [...products];

  // TODO (agent must implement):
  // - apply search filter (case-insensitive partial match, trim whitespace)
  // - apply category filter (case-insensitive exact match)
  // - apply inStock filter
  // - apply sorting (price_asc, price_desc, name_asc, name_desc)

  const total = result.length;
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const totalPages = Math.ceil(total / limit);
  const data = result.slice((page - 1) * limit, page * limit);

  return { data, total, page, limit, totalPages };
}
