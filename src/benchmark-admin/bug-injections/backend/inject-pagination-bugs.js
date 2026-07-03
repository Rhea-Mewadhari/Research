import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../benchmark-backend');

function write(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated: ${filePath}`);
}

// Three pagination bugs in getProducts:
//   Bug 1: COUNT(*) has no WHERE clause — total is always the unfiltered product count,
//          so totalPages is computed from 15 regardless of active filters
//   Bug 2: featured filter removed from SQL WHERE and applied in JS after pagination —
//          slices an already-paginated result, returning fewer items than the limit even
//          when more matching products exist on the same page
//   Bug 3: Math.floor instead of Math.ceil — a query with 11 results and limit 10
//          returns totalPages: 1 instead of totalPages: 2
//
// All three bugs are invisible when no filters are active (the full 15-product fixture
// makes the COUNT correct and 15 / 5 is an exact division).
write(
  path.join(repoRoot, 'src', 'services', 'productService.ts'),
  `import { db } from '../db/client';
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
    params.push(\`%\${query.search.trim().toLowerCase()}%\`);
  }
  if (query.category) {
    conditions.push('LOWER(category) = LOWER(?)');
    params.push(query.category);
  }
  if (query.inStock !== undefined) {
    conditions.push('in_stock = ?');
    params.push(query.inStock ? 1 : 0);
  }
  // Bug 2: featured excluded from SQL WHERE — applied in JS after the paginated slice

  const where = conditions.length ? \`WHERE \${conditions.join(' AND ')}\` : '';
  const orderBy = (query.sort && SORT_MAP[query.sort]) ?? 'CAST(id AS INTEGER) ASC';

  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const offset = (page - 1) * limit;

  // Bug 1: COUNT(*) without WHERE — always counts all products, ignores active filters
  const { count: total } = db
    .prepare('SELECT COUNT(*) AS count FROM products')
    .get() as { count: number };

  const rows = db
    .prepare(\`SELECT * FROM products \${where} ORDER BY \${orderBy} LIMIT ? OFFSET ?\`)
    .all([...params, limit, offset]) as Record<string, unknown>[];

  let data = rows.map(rowToProduct);

  // Bug 2: featured filter applied after pagination instead of in the SQL WHERE clause
  if (query.featured !== undefined) {
    data = data.filter((p) => p.featured === query.featured);
  }

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.floor(total / limit),  // Bug 3: floor rounds down — off by one at boundaries
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
    .prepare(\`SELECT * FROM products WHERE id IN (\${placeholders})\`)
    .all(ids) as Record<string, unknown>[];
  const rowMap = new Map(rows.map((r) => [String(r['id']), r]));
  return ids
    .map((id) => rowMap.get(id))
    .filter((r): r is Record<string, unknown> => r !== undefined)
    .map(rowToProduct);
}

export function getFeaturedProducts(): Product[] {
  const rows = db
    .prepare(\`
      SELECT p.*
      FROM products p
      LEFT JOIN featured_overrides fo ON fo.product_id = p.id
      WHERE COALESCE(fo.is_featured, p.featured) = 1
      ORDER BY CAST(p.id AS INTEGER)
    \`)
    .all() as Record<string, unknown>[];
  return rows.map(rowToProduct);
}
`
);

console.log('Pagination bugs injected successfully.');
