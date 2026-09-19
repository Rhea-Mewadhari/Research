import { fetchAllProducts } from './dataFetcher';
import type { Product, ProductQuery, PaginatedResponse } from '../types/product';

export async function getAllProducts(query: ProductQuery): Promise<PaginatedResponse<Product>> {
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

  if (query.featured !== undefined) {
    result = result.filter((p) => (p.featured ?? false) === query.featured);
  }

  if (query.sort === 'price_asc') {
    result = [...result].sort((a, b) => a.price - b.price);
  } else if (query.sort === 'price_desc') {
    result = [...result].sort((a, b) => b.price - a.price);
  } else if (query.sort === 'name_asc') {
    result = [...result].sort((a, b) => a.name.localeCompare(b.name));
  } else if (query.sort === 'name_desc') {
    result = [...result].sort((a, b) => b.name.localeCompare(a.name));
  } else if (query.sort === 'rating_desc') {
    result = [...result].sort((a, b) => b.rating - a.rating);
  }

  const total = result.length;
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const totalPages = Math.ceil(total / limit);
  const data = result.slice((page - 1) * limit, page * limit);

  return { data, total, page, limit, totalPages };
}
