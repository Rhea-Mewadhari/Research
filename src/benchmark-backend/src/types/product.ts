export type SortOption = 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'rating_desc';

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  description: string;
  tags: string[];
  discountPct?: number;
  featured?: boolean;
}

export interface ProductQuery {
  search?: string;
  category?: string;
  inStock?: boolean;
  featured?: boolean;
  sort?: SortOption;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
