export type Category = string;

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
};
