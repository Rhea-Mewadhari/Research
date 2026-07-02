import { db } from '../db/client';
import type { Product } from '../types/product';

function rowToProduct(row: Record<string, unknown>): Product {
  return {
    id: Number(row['id']),
    name: row['name'] as string,
    category: row['category'] as string,
    price: row['price'] as number,
    inStock: row['in_stock'] === 1,
    rating: row['rating'] as number,
    reviewCount: Math.round((row['rating'] as number) * 20),
    description: row['description'] as string,
    tags: JSON.parse(row['tags'] as string) as string[],
  };
}

export async function fetchAllProducts(): Promise<Product[]> {
  const rows = db
    .prepare('SELECT * FROM products ORDER BY CAST(id AS INTEGER)')
    .all() as Record<string, unknown>[];
  return rows.map(rowToProduct);
}
