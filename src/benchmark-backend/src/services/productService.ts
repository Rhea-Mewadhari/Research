import { fetchAllProducts } from './dataFetcher';
import type { Product, ProductQuery, PaginatedResponse, SortOption } from '../types/product';

const DEFAULT_LIMIT = 10;

function filterProducts(products: Product[], query: ProductQuery): Product[] {
  let result = products;

  if (query.search != null) {
    const term = query.search.trim().toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(term));
  }

  if (query.category != null) {
    result = result.filter(
      (p) => p.category.toLowerCase() === query.category!.toLowerCase()
    );
  }

  if (query.inStock != null) {
    result = result.filter((p) => (query.inStock ? p.inStock : !p.inStock));
  }

  return result;
}

function sortProducts(products: Product[], sort: SortOption | undefined): Product[] {
  if (sort === undefined) {
    return [...products];
  }
  if (sort === 'price_asc') {
    return [...products].sort((a, b) => a.price - b.price);
  }
  if (sort === 'price_desc') {
    return [...products].sort((a, b) => b.price - a.price);
  }
  if (sort === 'name_asc') {
    return [...products].sort((a, b) => a.name.localeCompare(b.name));
  }
  return [...products].sort((a, b) => b.name.localeCompare(a.name));
}

export async function getAllProducts(query: ProductQuery): Promise<PaginatedResponse<Product>> {
  const products = await fetchAllProducts();
  const filtered = filterProducts(products, query);
  const sorted = sortProducts(filtered, query.sort);

  const total = sorted.length;
  const page = query.page ?? 1;
  const limit = query.limit ?? DEFAULT_LIMIT;
  const totalPages = Math.ceil(total / limit);
  const data = sorted.slice((page - 1) * limit, page * limit);

  return { data, total, page, limit, totalPages };
}
