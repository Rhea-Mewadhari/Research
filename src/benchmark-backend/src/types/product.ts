export type SortOption = 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc';

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
}

export interface ProductQuery {
  search?: string;
  category?: string;
  inStock?: boolean;
  sort?: SortOption;
}
