import { fetchAllProducts } from './dataFetcher';
import type { Product, ProductQuery, PaginatedResponse, SortOption } from '../types/product';

function filterProducts(products: Product[], query: ProductQuery): Product[] {
  let result = products;

  if (query.search !== undefined) {
    const term = query.search.trim().toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(term));
  }

  if (query.category !== undefined) {
    result = result.filter(
      (p) => p.category.toLowerCase() === query.category!.toLowerCase()
    );
  }

  if (query.inStock !== undefined) {
    result = result.filter((p) => p.inStock === query.inStock);
  }

  return result;
}

function sortProducts(products: Product[], sort?: SortOption): Product[] {
  if (sort === 'price_asc') {
    return [...products].sort((a, b) => a.price - b.price);
  }
  if (sort === 'price_desc') {
    return [...products].sort((a, b) => b.price - a.price);
  }
  if (sort === 'name_asc') {
    return [...products].sort((a, b) => a.name.localeCompare(b.name));
  }
  if (sort === 'name_desc') {
    return [...products].sort((a, b) => b.name.localeCompare(a.name));
  }
  return products;
}

export async function getAllProducts(query: ProductQuery): Promise<PaginatedResponse<Product>> {
  const products = await fetchAllProducts();
  const filtered = filterProducts([...products], query);
  const sorted = sortProducts(filtered, query.sort);

  const total = sorted.length;
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const totalPages = Math.ceil(total / limit);
  const data = sorted.slice((page - 1) * limit, page * limit);

  return { data, total, page, limit, totalPages };
}
