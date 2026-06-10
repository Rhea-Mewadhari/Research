import type { Product } from '../types/product';

export type FilterState = {
  search: string;
  category: string;
  inStockOnly: boolean;
  sortBy: 'default' | 'price-asc' | 'price-desc' | 'rating-desc';
};

export function filterProducts(products: Product[], _filters: FilterState): Product[] {
  let result = [...products];

  // TODO: implement search filter
  // TODO: implement category filter
  // TODO: implement in-stock filter
  // TODO: implement sorting

  return result;
}