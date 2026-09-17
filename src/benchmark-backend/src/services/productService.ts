import { fetchAllProducts } from './dataFetcher';
import type { ProductQuery } from '../types/product';

type InternalSort = 'priceAsc' | 'priceDesc' | 'ratingDesc' | 'nameAsc' | 'nameDesc';

export async function getAllProducts(query: ProductQuery & { sort?: InternalSort }): Promise<Record<string, unknown>> {
  const products = await fetchAllProducts();
  let result = [...products];

  if (query.search) {
    const term = query.search.trim().toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(term));
  }

  if (query.category) {
    result = result.filter(
      (p) => p.category.toLowerCase() === query.category!.toLowerCase()
    );
  }

  if (query.inStock !== undefined) {
    result = result.filter((p) => p.inStock === query.inStock);
  }

  if (query.sort === 'priceAsc') {
    result = [...result].sort((a, b) => a.price - b.price);
  } else if (query.sort === 'priceDesc') {
    result = [...result].sort((a, b) => b.price - a.price);
  } else if (query.sort === 'ratingDesc') {
    result = [...result].sort((a, b) => b.rating - a.rating);
  } else if (query.sort === 'nameAsc') {
    result = [...result].sort((a, b) => a.name.localeCompare(b.name));
  } else if (query.sort === 'nameDesc') {
    result = [...result].sort((a, b) => b.name.localeCompare(a.name));
  }

  const total = result.length;
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const totalPages = Math.ceil(total / limit);
  const data = result.slice((page - 1) * limit, page * limit);

  return { data, total, page, limit, totalPages };
}
