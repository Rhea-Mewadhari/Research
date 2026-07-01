import type { Product, SortOption } from '../types/product';

export type FilterState = {
  search: string;
  category: string;
  inStockOnly: boolean;
  sortBy: SortOption;
};

export function filterProducts(products: Product[], filters: FilterState): Product[] {
  const term = filters.search.trim().toLowerCase();

  let result = products.filter((p) => {
    if (term && !p.name.toLowerCase().includes(term)) return false;
    if (filters.category !== 'All' && p.category !== filters.category) return false;
    if (filters.inStockOnly && !p.inStock) return false;
    return true;
  });

  switch (filters.sortBy) {
    case 'price-asc':
      result = [...result].sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      result = [...result].sort((a, b) => b.price - a.price);
      break;
    case 'rating-desc':
      result = [...result].sort((a, b) => b.rating - a.rating);
      break;
  }

  return result;
}