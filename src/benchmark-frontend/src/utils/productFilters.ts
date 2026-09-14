import type { Product } from '../types/product';

export type FilterState = {
  search: string;
  category: string;
  inStockOnly: boolean;
  sortBy: 'default' | 'price-asc' | 'price-desc' | 'rating-desc';
};

export function filterProducts(products: Product[], filters: FilterState): Product[] {
  let result = [...products];

  const trimmedSearch = filters.search.trim();
  if (trimmedSearch !== '') {
    const lower = trimmedSearch.toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(lower));
  }

  if (filters.category !== 'All') {
    result = result.filter((p) => p.category === filters.category);
  }

  if (filters.inStockOnly) {
    result = result.filter((p) => p.inStock === true);
  }

  if (filters.sortBy === 'price-asc') {
    return [...result].sort((a, b) => a.price - b.price);
  } else if (filters.sortBy === 'price-desc') {
    return [...result].sort((a, b) => b.price - a.price);
  } else if (filters.sortBy === 'rating-desc') {
    return [...result].sort((a, b) => b.rating - a.rating);
  }

  return result;
}