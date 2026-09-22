import { randomUUID } from 'node:crypto';
import { db } from '../db/client';
import type { Favourite } from '../types/product';
import { AppError, DatabaseError, ProductNotFoundError } from '../errors';

function rowToFavourite(row: Record<string, unknown>): Favourite {
  return {
    id: row['id'] as string,
    productId: row['product_id'] as string,
    createdAt: row['created_at'] as string,
  };
}

export function addFavourite(productId: string): { favourite: Favourite; created: boolean } {
  try {
    const product = db
      .prepare('SELECT 1 FROM products WHERE id = ?')
      .get(productId);
    if (!product) {
      throw new ProductNotFoundError(productId);
    }
    const result = db
      .prepare('INSERT OR IGNORE INTO favourites (id, product_id) VALUES (?, ?)')
      .run(randomUUID(), productId);
    const row = db
      .prepare('SELECT * FROM favourites WHERE product_id = ?')
      .get(productId) as Record<string, unknown>;
    return { favourite: rowToFavourite(row), created: result.changes === 1 };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new DatabaseError('Failed to add favourite', err);
  }
}

export function removeFavourite(productId: string): boolean {
  const result = db
    .prepare('DELETE FROM favourites WHERE product_id = ?')
    .run(productId);
  return result.changes > 0;
}

export function isFavourite(productId: string): boolean {
  return !!db.prepare('SELECT 1 FROM favourites WHERE product_id = ?').get(productId);
}

export function getFavourites(): Favourite[] {
  const rows = db
    .prepare('SELECT * FROM favourites ORDER BY created_at DESC')
    .all() as Record<string, unknown>[];
  return rows.map(rowToFavourite);
}
