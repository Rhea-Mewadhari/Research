import { db } from '../db/client';
import type { Product, ComparisonResult } from '../types/product';
import { ValidationError } from '../errors';

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
    description: row['description'] as string,
    featured: row['featured'] === 1,
    images: JSON.parse(row['images'] as string) as string[],
    tags: JSON.parse(row['tags'] as string) as string[],
    createdAt: row['created_at'] as string,
  };
}

export function getComparison(ids: string[]): ComparisonResult {
  if (ids.length < 2) {
    throw new ValidationError('At least 2 product IDs are required');
  }
  if (ids.length > 3) {
    throw new ValidationError('At most 3 product IDs are allowed');
  }
  const uniqueIds = [...new Set(ids)];
  if (uniqueIds.length !== ids.length) {
    throw new ValidationError('Duplicate product IDs are not allowed');
  }

  const placeholders = ids.map(() => '?').join(', ');
  const rows = db
    .prepare(`SELECT * FROM products WHERE id IN (${placeholders})`)
    .all(ids) as Record<string, unknown>[];

  const foundMap = new Map(rows.map((r) => [String(r['id']), r]));

  const products: Product[] = [];
  for (const id of ids) {
    const row = foundMap.get(id);
    if (!row) {
      throw new ValidationError(`Product not found: ${id}`);
    }
    products.push(rowToProduct(row));
  }

  return { products, count: products.length };
}
