import type { Product } from '../types/product';

export type FilterState = {
  search: string;
  category: string;
  inStockOnly: boolean;
  sortBy: 'default' | 'price-asc' | 'price-desc' | 'rating-desc';
};

export function filterProducts(products: Product[], filters: FilterState): Product[] {
  const result = products.filter((product) => {
    const searchTerm = filters.search.trim().toLowerCase();
    if (searchTerm !== '' && !product.name.toLowerCase().includes(searchTerm)) {
      return false;
    }
    if (filters.category !== 'All' && product.category !== filters.category) {
      return false;
    }
    if (filters.inStockOnly && !product.inStock) {
      return false;
    }
    return true;
  });

  if (filters.sortBy === 'price-asc') {
    return [...result].sort((a, b) => a.price - b.price);
  }
  if (filters.sortBy === 'price-desc') {
    return [...result].sort((a, b) => b.price - a.price);
  }
  if (filters.sortBy === 'rating-desc') {
    return [...result].sort((a, b) => b.rating - a.rating);
  }
  return result;
}