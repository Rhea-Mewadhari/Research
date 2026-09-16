import type { Product } from '../types/product';

export type FilterState = {
  search: string;
  category: string;
  inStockOnly: boolean;
  sortBy: 'default' | 'price-asc' | 'price-desc' | 'rating-desc';
};

export function filterProducts(products: Product[], filters: FilterState): Product[] {
  let result = [...products];

  if (filters.search.trim() !== '') {
    const searchTerm = filters.search.trim().toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(searchTerm));
  }

  if (filters.category !== 'All') {
    result = result.filter((p) => p.category === filters.category);
  }

  if (filters.inStockOnly === true) {
    result = result.filter((p) => p.inStock === true);
  }

  const sorted = [...result];
  if (filters.sortBy === 'price-asc') {
    sorted.sort((a, b) => a.price - b.price);
  } else if (filters.sortBy === 'price-desc') {
    sorted.sort((a, b) => b.price - a.price);
  } else if (filters.sortBy === 'rating-desc') {
    sorted.sort((a, b) => b.rating - a.rating);
  }
  return sorted;
}
