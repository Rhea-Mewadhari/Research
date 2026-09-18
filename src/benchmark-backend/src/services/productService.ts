import { fetchAllProducts } from './dataFetcher';
import type { Product, ProductQuery, PaginatedResponse, SortOption } from '../types/product';

const DEFAULT_LIMIT = 10;

function filterProducts(products: Product[], query: ProductQuery): Product[] {
  let result = products;

  if (query.search !== undefined) {
    const term = query.search.trim().toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(term));
  }

  if (query.category !== undefined) {
    const category = query.category;
    result = result.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (query.inStock !== undefined) {
    if (query.inStock) {
      result = result.filter((p) => p.inStock);
    } else {
      result = result.filter((p) => !p.inStock);
    }
  }

  return result;
}

function sortProducts(products: Product[], sort: SortOption | undefined): Product[] {
  if (sort === 'price_asc') {
    return [...products].sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    return [...products].sort((a, b) => b.price - a.price);
  } else if (sort === 'name_asc') {
    return [...products].sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === 'name_desc') {
    return [...products].sort((a, b) => b.name.localeCompare(a.name));
  }
  return products;
}

export async function getAllProducts(query: ProductQuery): Promise<PaginatedResponse<Product>> {
  const products = await fetchAllProducts();
  const filtered = filterProducts(products, query);
  const result = sortProducts(filtered, query.sort);

  const total = result.length;
  const page = query.page ?? 1;
  const limit = query.limit ?? DEFAULT_LIMIT;
  const totalPages = Math.ceil(total / limit);
  const data = result.slice((page - 1) * limit, page * limit);

  return { data, total, page, limit, totalPages };
}
