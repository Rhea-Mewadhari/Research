import type { Product } from '../types/product';

export type FilterState = {
  search: string;
  category: string;
  inStockOnly: boolean;
  sortBy: 'default' | 'price-asc' | 'price-desc' | 'rating-desc';
};

export function filterProducts(products: Product[], filters: FilterState): Product[] {
  let result = [...products];

  const search = filters.search.trim().toLowerCase();
  if (search) {
    result = result.filter((p) => p.name.toLowerCase().includes(search));
  }

  if (filters.category !== 'All') {
    result = result.filter((p) => p.category === filters.category);
  }

  if (filters.inStockOnly) {
    result = result.filter((p) => p.inStock);
  }

  if (filters.sortBy === 'price-asc') {
    result = [...result].sort((a, b) => a.price - b.price);
  } else if (filters.sortBy === 'price-desc') {
    result = [...result].sort((a, b) => b.price - a.price);
  } else if (filters.sortBy === 'rating-desc') {
    result = [...result].sort((a, b) => b.rating - a.rating);
  }

  return result;
}