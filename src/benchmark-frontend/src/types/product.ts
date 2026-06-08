export type Category = 'Electronics' | 'Fitness' | 'Accessories';

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
