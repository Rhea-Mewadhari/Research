import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../benchmark-backend');

function write(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated: ${filePath}`);
}

// Bug A: foreign_keys pragma removed — SQLite does not enforce FK constraints by default,
// so inserting a favourite for a non-existent product silently succeeds.
write(
  path.join(repoRoot, 'src', 'db', 'client.ts'),
  `import Database from 'better-sqlite3';
import { join } from 'node:path';

const dbPath =
  process.env.NODE_ENV === 'test'
    ? ':memory:'
    : join(process.cwd(), 'benchmark.db');

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
`
);

// Three service-layer bugs:
//   Bug 1: productExists check removed — no validation that the product exists before insert
//   Bug 2: check-then-insert replaces INSERT OR IGNORE — not atomic under concurrent access
//   Bug 3: removeFavourite uses result.changes > -1 instead of > 0 — always returns true,
//          even when no row was deleted, so DELETE for a non-existent favourite returns 204
write(
  path.join(repoRoot, 'src', 'services', 'favouritesService.ts'),
  `import { randomUUID } from 'node:crypto';
import { db } from '../db/client';
import type { Favourite } from '../types/product';
import { DatabaseError } from '../errors';

function rowToFavourite(row: Record<string, unknown>): Favourite {
  return {
    id: row['id'] as string,
    productId: row['product_id'] as string,
    createdAt: row['created_at'] as string,
  };
}

export function addFavourite(productId: string): { favourite: Favourite; created: boolean } {
  try {
    const existing = db
      .prepare('SELECT * FROM favourites WHERE product_id = ?')
      .get(productId) as Record<string, unknown> | undefined;
    if (existing) {
      return { favourite: rowToFavourite(existing), created: false };
    }
    db.prepare('INSERT INTO favourites (id, product_id) VALUES (?, ?)').run(randomUUID(), productId);
    const row = db
      .prepare('SELECT * FROM favourites WHERE product_id = ?')
      .get(productId) as Record<string, unknown>;
    return { favourite: rowToFavourite(row), created: true };
  } catch (err) {
    throw new DatabaseError('Failed to add favourite', err);
  }
}

export function removeFavourite(productId: string): boolean {
  const result = db
    .prepare('DELETE FROM favourites WHERE product_id = ?')
    .run(productId);
  return result.changes > -1;
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
`
);

console.log('DB integrity bugs injected successfully.');
