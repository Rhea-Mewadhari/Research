import { db } from './client';
import { products as fixture } from '../data/products';

interface DummyJsonProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  rating: number;
  tags: string[];
  images: string[];
  discountPercentage?: number;
}

interface DummyJsonResponse {
  products: DummyJsonProduct[];
  total: number;
}

const DUMMY_JSON_URL =
  'https://dummyjson.com/products?limit=200&select=id,title,description,price,category,stock,rating,tags,images,discountPercentage';

type ProductRow = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: number;
  rating: number;
  stock: number;
  featured: number;
  images: string;
  tags: string;
};

function bulkInsert(rows: ProductRow[]): void {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO products
      (id, name, description, price, category, in_stock, rating, stock, featured, images, tags)
    VALUES
      (@id, @name, @description, @price, @category, @inStock, @rating, @stock, @featured, @images, @tags)
  `);
  db.transaction((items: ProductRow[]) => {
    for (const row of items) stmt.run(row);
  })(rows);
}

function seedFromFixture(): void {
  const rows: ProductRow[] = fixture.map((p) => ({
    id: String(p.id),
    name: p.name,
    description: p.description,
    price: p.price,
    category: p.category,
    inStock: p.inStock ? 1 : 0,
    rating: p.rating,
    stock: p.stock,
    featured: p.featured ? 1 : 0,
    images: JSON.stringify(p.images),
    tags: JSON.stringify(p.tags),
  }));
  bulkInsert(rows);
}

async function seedFromApi(): Promise<void> {
  const res = await fetch(DUMMY_JSON_URL);
  if (!res.ok) throw new Error(`DummyJSON fetch failed: ${res.status}`);
  const { products } = (await res.json()) as DummyJsonResponse;

  const rows: ProductRow[] = products.map((p) => ({
    id: String(p.id),
    name: p.title,
    description: p.description,
    price: p.price,
    category: p.category,
    inStock: p.stock > 0 ? 1 : 0,
    rating: p.rating,
    stock: p.stock,
    // mark the top-rated products as featured
    featured: p.rating >= 4.9 ? 1 : 0,
    images: JSON.stringify(p.images ?? []),
    tags: JSON.stringify(p.tags ?? []),
  }));

  bulkInsert(rows);
  console.log(`  seeded ${rows.length} products from DummyJSON`);
}

export async function seed(): Promise<void> {
  const { count } = db
    .prepare('SELECT COUNT(*) AS count FROM products')
    .get() as { count: number };
  if (count > 0) return;

  if (process.env.NODE_ENV === 'test') {
    seedFromFixture();
  } else {
    await seedFromApi();
  }
}

