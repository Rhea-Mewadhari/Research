import { fetchAllProducts } from './dataFetcher';
import type { ProductQuery } from '../types/product';

type InternalSort = 'price-asc' | 'price-desc' | 'rating-desc' | 'name-asc' | 'name-desc';

export async function getAllProducts(query: Omit<ProductQuery, 'sort'> & { sort?: InternalSort }): Promise<Record<string, unknown>> {
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

  if (query.sort === 'price-asc') {
    result = [...result].sort((a, b) => a.price - b.price);
  } else if (query.sort === 'price-desc') {
    result = [...result].sort((a, b) => b.price - a.price);
  } else if (query.sort === 'rating-desc') {
    result = [...result].sort((a, b) => b.rating - a.rating);
  } else if (query.sort === 'name-asc') {
    result = [...result].sort((a, b) => a.name.localeCompare(b.name));
  } else if (query.sort === 'name-desc') {
    result = [...result].sort((a, b) => b.name.localeCompare(a.name));
  }

  const count = result.length;
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const pages = Math.ceil(count / limit);
  const data = result.slice((page - 1) * limit, page * limit);

  return { data, total: count, page, limit, totalPages: pages };
}
