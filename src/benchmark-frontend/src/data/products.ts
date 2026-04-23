import type { Product } from '../types/product';

export const products: Product[] = [
  { id: 1, name: 'Wireless Mouse', category: 'Electronics', price: 25, inStock: true, rating: 4.3 },
  { id: 2, name: 'Yoga Mat', category: 'Fitness', price: 40, inStock: true, rating: 4.8 },
  { id: 3, name: 'USB-C Hub', category: 'Electronics', price: 60, inStock: false, rating: 4.1 },
  { id: 4, name: 'Resistance Bands', category: 'Fitness', price: 30, inStock: true, rating: 4.0 },
  { id: 5, name: 'Laptop Stand', category: 'Accessories', price: 55, inStock: true, rating: 4.6 },
  { id: 6, name: 'Desk Lamp', category: 'Accessories', price: 45, inStock: false, rating: 3.9 }
];