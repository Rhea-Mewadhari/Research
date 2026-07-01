export type Category = string;

export type SortOption = 'default' | 'price-asc' | 'price-desc' | 'rating-desc';

export interface SavedFilter {
  id: string;
  name: string;
  createdAt: number;
  snapshot: {
    search: string;
    category: string;
    inStockOnly: boolean;
    sortBy: SortOption;
  };
}

export interface ComparisonState {
  comparedIds: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type Product = {
  id: number;
  name: string;
  category: Category;
  price: number;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  description: string;
  tags: string[];
  discountPct?: number;
  featured?: boolean;
  images?: string[];
  stock?: number;
};
