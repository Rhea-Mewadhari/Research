import type { Product } from '../types/product';

export type FilterState = {
  search: string;
  category: string;
  inStockOnly: boolean;
  sortBy: 'default' | 'price-asc' | 'price-desc' | 'rating-desc';
};

export function filterProducts(products: Product[], filters: FilterState): Product[] {
  let result = [...products];

  if (filters.search) {
    result = result.filter((product) => product.name.toLowerCase().includes(filters.search.trim().toLowerCase()));
  }

  if (filters.category !== 'All') {
    result = result.filter((product) => product.category === filters.category);
  }

  if (filters.inStockOnly) {
    result = result.filter((product) => product.inStock);
  }

  if (filters.sortBy === 'price-asc') {
    result.sort((a, b) => a.price - b.price);
  } else if (filters.sortBy === 'price-desc') {
    result.sort((a, b) => b.price - a.price);
  } else if (filters.sortBy === 'rating-desc') {
    result.sort((a, b) => b.rating - a.rating);
  }

  return result;
}
