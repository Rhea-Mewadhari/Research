import { db } from '../db/client';
import type { Product, ProductQuery, PaginatedResult } from '../types/product';

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

const SORT_MAP: Record<string, string> = {
  price_asc: 'price ASC',
  price_desc: 'price DESC',
  name_asc: 'LOWER(name) ASC',
  name_desc: 'LOWER(name) DESC',
  rating_desc: 'rating DESC',
};

export function getProducts(query: ProductQuery): PaginatedResult<Product> {
  const conditions: string[] = [];
  const params: Array<string | number> = [];

  if (query.search) {
    conditions.push('LOWER(name) LIKE ?');
    params.push(`%${query.search.trim().toLowerCase()}%`);
  }
  if (query.category) {
    conditions.push('LOWER(category) = LOWER(?)');
    params.push(query.category);
  }
  if (query.inStock !== undefined) {
    conditions.push('in_stock = ?');
    params.push(query.inStock ? 1 : 0);
  }
  if (query.featured !== undefined) {
    conditions.push('featured = ?');
    params.push(query.featured ? 1 : 0);
  }

  const where =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderBy = (query.sort && SORT_MAP[query.sort]) ?? 'CAST(id AS INTEGER) ASC';

  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const offset = (page - 1) * limit;

  const { count: total } = db
    .prepare(`SELECT COUNT(*) AS count FROM products ${where}`)
    .get(params) as { count: number };

  const rows = db
    .prepare(`SELECT * FROM products ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`)
    .all([...params, limit, offset]) as Record<string, unknown>[];

  const data = rows.map(rowToProduct);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export function getProductById(id: string): Product | null {
  const row = db
    .prepare('SELECT * FROM products WHERE id = ?')
    .get(id) as Record<string, unknown> | undefined;
  return row ? rowToProduct(row) : null;
}

export function getProductsByIds(ids: string[]): Product[] {
  if (ids.length === 0) return [];
  const placeholders = ids.map(() => '?').join(', ');
  const rows = db
    .prepare(`SELECT * FROM products WHERE id IN (${placeholders})`)
    .all(ids) as Record<string, unknown>[];
  const rowMap = new Map(rows.map((r) => [String(r['id']), r]));
  return ids
    .map((id) => rowMap.get(id))
    .filter((r): r is Record<string, unknown> => r !== undefined)
    .map(rowToProduct);
}

export function getFeaturedProducts(): Product[] {
  const rows = db
    .prepare(`
      SELECT p.*
      FROM products p
      LEFT JOIN featured_overrides fo ON fo.product_id = p.id
      WHERE COALESCE(fo.is_featured, p.featured) = 1
      ORDER BY CAST(p.id AS INTEGER)
    `)
    .all() as Record<string, unknown>[];
  return rows.map(rowToProduct);
}
