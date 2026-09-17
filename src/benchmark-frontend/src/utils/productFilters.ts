import type { Product } from '../types/product';

export type FilterState = {
  search: string;
  category: string;
  inStockOnly: boolean;
  sortBy: 'default' | 'price-asc' | 'price-desc' | 'rating-desc';
};

export function filterProducts(products: Product[], filters: FilterState): Product[] {
  const search = filters.search.trim().toLowerCase();

  let result = products.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search)) return false;
    if (filters.category !== 'All' && p.category !== filters.category) return false;
    if (filters.inStockOnly && !p.inStock) return false;
    return true;
  });

  if (filters.sortBy === 'price-asc') {
    result = [...result].sort((a, b) => a.price - b.price);
  } else if (filters.sortBy === 'price-desc') {
    result = [...result].sort((a, b) => b.price - a.price);
  } else if (filters.sortBy === 'rating-desc') {
    result = [...result].sort((a, b) => b.rating - a.rating);
  }

  return result;
}