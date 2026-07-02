export type SortOption = 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'rating_desc';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
  stock: number;
  rating: number;
  reviewCount: number;
  featured: boolean;
  images: string[];
  tags: string[];
  createdAt: string;
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

export type PaginatedResult<T> = PaginatedResponse<T>;

export interface ComparisonResult {
  products: Product[];
  count: number;
}

export interface Favourite {
  id: string;
  productId: string;
  createdAt: string;
}
