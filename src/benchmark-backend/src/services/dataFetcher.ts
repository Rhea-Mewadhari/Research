import { db } from '../db/client';
import type { Product } from '../types/product';

function rowToProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row['id']),
    name: row['name'] as string,
    category: row['category'] as string,
    price: row['price'] as number,
    inStock: row['in_stock'] === 1,
    stock: row['stock'] as number,
    rating: row['rating'] as number,
    reviewCount: Math.round((row['rating'] as number) * 20),
    featured: row['featured'] === 1,
    images: JSON.parse(row['images'] as string) as string[],
    description: row['description'] as string,
    tags: JSON.parse(row['tags'] as string) as string[],
    createdAt: row['created_at'] as string,
  };
}

export async function fetchAllProducts(): Promise<Product[]> {
  const rows = db
    .prepare('SELECT * FROM products ORDER BY CAST(id AS INTEGER)')
    .all() as Record<string, unknown>[];
  return rows.map(rowToProduct);
}
