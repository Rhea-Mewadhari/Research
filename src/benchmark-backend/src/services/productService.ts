import { fetchAllProducts } from './dataFetcher';
import type { Product, ProductQuery, PaginatedResponse } from '../types/product';


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
    const inStock = query.inStock;
    result = result.filter((p) => p.inStock === inStock);
  }

  return result;
}

function sortProducts(products: Product[], sort: ProductQuery['sort']): Product[] {
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
  const sorted = sortProducts(filtered, query.sort);

  const total = sorted.length;
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const totalPages = Math.ceil(total / limit);
  const data = sorted.slice((page - 1) * limit, page * limit);

  return { data, total, page, limit, totalPages };
}
