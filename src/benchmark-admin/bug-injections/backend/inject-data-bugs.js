import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../benchmark-backend');

function write(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated: ${filePath}`);
}

// ─── types/product.ts ─────────────────────────────────────────────────────────
// Adds featured?: boolean to Product and ProductQuery.
// Adds 'rating_desc' to SortOption.
// The agent must NOT touch this file — the types are already correct.

write(
  path.join(repoRoot, 'src', 'types', 'product.ts'),
  `export type SortOption = 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'rating_desc';

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  description: string;
  tags: string[];
  discountPct?: number;
  featured?: boolean;
}

export interface ProductQuery {
  search?: string;
  category?: string;
  inStock?: boolean;
  featured?: boolean;
  sort?: SortOption;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
`
);

// ─── data/products.ts ─────────────────────────────────────────────────────────
// featured field is ABSENT from all products.
// Agent must set featured: true on ids 1, 8, 11, 14.

write(
  path.join(repoRoot, 'src', 'data', 'products.ts'),
  `import type { Product } from '../types/product';

export const products: Product[] = [
  {
    id: 1,
    name: 'Laptop',
    category: 'electronics',
    price: 999,
    inStock: true,
    rating: 4.5,
    reviewCount: 234,
    description: '14-inch laptop with Intel Core i7, 16 GB RAM, and 512 GB NVMe SSD.',
    tags: ['portable', 'work', 'performance'],
  },
  {
    id: 2,
    name: 'Smartphone',
    category: 'electronics',
    price: 699,
    inStock: true,
    rating: 4.3,
    reviewCount: 189,
    description: '6.4-inch AMOLED display with 5G connectivity and a triple-lens 108 MP camera.',
    tags: ['mobile', '5g', 'camera'],
  },
  {
    id: 3,
    name: 'Wireless Headphones',
    category: 'electronics',
    price: 149,
    inStock: false,
    rating: 4.6,
    reviewCount: 312,
    description: 'Over-ear headphones with 40-hour battery and adaptive noise cancellation.',
    tags: ['audio', 'noise-cancelling', 'bluetooth'],
  },
  {
    id: 4,
    name: 'Mechanical Keyboard',
    category: 'electronics',
    price: 89,
    inStock: true,
    rating: 4.4,
    reviewCount: 156,
    description: 'Tenkeyless board with hot-swappable switches and per-key RGB backlighting.',
    tags: ['typing', 'rgb', 'tenkeyless'],
  },
  {
    id: 5,
    name: 'Linen Shirt',
    category: 'clothing',
    price: 49,
    inStock: true,
    rating: 3.8,
    reviewCount: 67,
    description: 'Relaxed-fit linen shirt, available in four colourways. Machine washable.',
    tags: ['casual', 'breathable', 'summer'],
  },
  {
    id: 6,
    name: 'Running Shoes',
    category: 'clothing',
    price: 119,
    inStock: true,
    rating: 4.5,
    reviewCount: 201,
    description: 'Lightweight trainer with responsive foam midsole and breathable mesh upper.',
    tags: ['running', 'cushioned', 'lightweight'],
  },
  {
    id: 7,
    name: 'Winter Jacket',
    category: 'clothing',
    price: 189,
    inStock: false,
    rating: 4.1,
    reviewCount: 143,
    description: 'Waterproof shell with 600-fill goose down insulation and an adjustable hood.',
    tags: ['insulated', 'waterproof', 'outdoor'],
  },
  {
    id: 8,
    name: 'Ergonomic Chair',
    category: 'furniture',
    price: 549,
    inStock: true,
    rating: 4.7,
    reviewCount: 98,
    description: 'Task chair with adjustable lumbar support, armrests, and seat height. 8-year warranty.',
    tags: ['ergonomic', 'lumbar', 'adjustable'],
  },
  {
    id: 9,
    name: 'Standing Desk',
    category: 'furniture',
    price: 399,
    inStock: false,
    rating: 4.3,
    reviewCount: 54,
    description: 'Electric height-adjustable desk with memory presets and a quiet dual-motor lift.',
    tags: ['adjustable', 'sit-stand', 'electric'],
  },
  {
    id: 10,
    name: 'Bookshelf',
    category: 'furniture',
    price: 149,
    inStock: true,
    rating: 4.0,
    reviewCount: 87,
    description: 'Solid pine bookshelf with five fixed shelves. Requires wall anchoring.',
    tags: ['storage', 'wood', 'home-office'],
  },
  {
    id: 11,
    name: 'Yoga Mat',
    category: 'sports',
    price: 39,
    inStock: true,
    rating: 4.8,
    reviewCount: 341,
    description: '5 mm natural rubber mat with alignment guides and a moisture-wicking surface.',
    tags: ['yoga', 'non-slip', 'eco'],
  },
  {
    id: 12,
    name: 'Resistance Bands',
    category: 'sports',
    price: 24,
    inStock: true,
    rating: 4.2,
    reviewCount: 112,
    description: 'Set of four TPE bands in light, medium, heavy, and extra-heavy resistance.',
    tags: ['strength', 'portable', 'set'],
    discountPct: 10,
  },
  {
    id: 13,
    name: 'Jump Rope',
    category: 'sports',
    price: 19,
    inStock: false,
    rating: 4.1,
    reviewCount: 76,
    description: 'Speed rope with aircraft-grade steel cable and ball-bearing aluminium handles.',
    tags: ['cardio', 'speed', 'steel-cable'],
    discountPct: 20,
  },
  {
    id: 14,
    name: 'Clean Code',
    category: 'books',
    price: 35,
    inStock: true,
    rating: 4.9,
    reviewCount: 567,
    description: 'A handbook of agile software craftsmanship. Essential reading for working developers.',
    tags: ['programming', 'best-practices', 'refactoring'],
    discountPct: 15,
  },
  {
    id: 15,
    name: 'The Pragmatic Programmer',
    category: 'books',
    price: 42,
    inStock: true,
    rating: 4.8,
    reviewCount: 489,
    description: 'From journeyman to master — timeless advice for software professionals.',
    tags: ['programming', 'career', 'best-practices'],
  },
];
`
);

// ─── services/productService.ts ───────────────────────────────────────────────
// Fully working for existing filters and sorts.
// Missing: featured filter and rating_desc sort (marked with TODO).

write(
  path.join(repoRoot, 'src', 'services', 'productService.ts'),
  `import { fetchAllProducts } from './dataFetcher';
import type { Product, ProductQuery, PaginatedResponse } from '../types/product';

export async function getAllProducts(query: ProductQuery): Promise<PaginatedResponse<Product>> {
  const products = await fetchAllProducts();
  let result = [...products];

  if (query.search) {
    const term = query.search.trim().toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(term));
  }

  if (query.category) {
    result = result.filter(
      (p) => p.category.toLowerCase() === query.category!.toLowerCase()
    );
  }

  if (query.inStock !== undefined) {
    result = result.filter((p) => p.inStock === query.inStock);
  }

  // TODO: apply featured filter

  if (query.sort === 'price_asc') {
    result = [...result].sort((a, b) => a.price - b.price);
  } else if (query.sort === 'price_desc') {
    result = [...result].sort((a, b) => b.price - a.price);
  } else if (query.sort === 'name_asc') {
    result = [...result].sort((a, b) => a.name.localeCompare(b.name));
  } else if (query.sort === 'name_desc') {
    result = [...result].sort((a, b) => b.name.localeCompare(a.name));
  }
  // TODO: handle 'rating_desc' sort

  const total = result.length;
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const totalPages = Math.ceil(total / limit);
  const data = result.slice((page - 1) * limit, page * limit);

  return { data, total, page, limit, totalPages };
}
`
);

// ─── utils/queryParser.ts ─────────────────────────────────────────────────────
// Handles all existing query params.
// Missing: 'rating_desc' not in VALID_SORT_OPTIONS, 'featured' not parsed.

write(
  path.join(repoRoot, 'src', 'utils', 'queryParser.ts'),
  `import type { ProductQuery, SortOption } from '../types/product';

const VALID_SORT_OPTIONS: SortOption[] = ['price_asc', 'price_desc', 'name_asc', 'name_desc'];
// TODO: add 'rating_desc' to VALID_SORT_OPTIONS

export function parseProductQuery(raw: Record<string, unknown>): ProductQuery {
  const query: ProductQuery = {};

  if (typeof raw.search === 'string') {
    query.search = raw.search;
  }

  if (typeof raw.category === 'string') {
    query.category = raw.category;
  }

  if (raw.inStock === 'true') {
    query.inStock = true;
  } else if (raw.inStock === 'false') {
    query.inStock = false;
  }

  // TODO: parse 'featured' query param

  if (VALID_SORT_OPTIONS.includes(raw.sort as SortOption)) {
    query.sort = raw.sort as SortOption;
  }

  const pageVal = parseInt(String(raw.page), 10);
  if (!isNaN(pageVal) && pageVal > 0) {
    query.page = pageVal;
  }

  const limitVal = parseInt(String(raw.limit), 10);
  if (!isNaN(limitVal) && limitVal > 0) {
    query.limit = Math.min(limitVal, 50);
  }

  return query;
}
`
);

// ─── tests/visible/products.test.ts ───────────────────────────────────────────
// Existing tests preserved. New failing suites added for featured + rating_desc.

write(
  path.join(repoRoot, 'src', 'tests', 'visible', 'products.test.ts'),
  `import { vi } from 'vitest';

const mockFetchAllProducts = vi.hoisted(() => vi.fn());

vi.mock('../../services/dataFetcher', () => ({
  fetchAllProducts: mockFetchAllProducts,
}));

import request from 'supertest';
import app from '../../app';
import { products as MOCK_PRODUCTS } from '../../data/products';

const AUTH = { Authorization: 'Bearer benchmark-token-2024' };

beforeAll(() => {
  mockFetchAllProducts.mockResolvedValue([...MOCK_PRODUCTS]);
});

describe('GET /products', () => {
  it('returns all products with pagination envelope', async () => {
    const res = await request(app).get('/products?limit=50').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(15);
    expect(res.body.data.length).toBe(15);
  });

  it('filters by category', async () => {
    const res = await request(app).get('/products?category=electronics&limit=50').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(4);
    expect(res.body.data.every((p: any) => p.category === 'electronics')).toBe(true);
  });

  it('returns empty array for unknown category', async () => {
    const res = await request(app).get('/products?category=nonexistent&limit=50').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('filters in-stock products', async () => {
    const res = await request(app).get('/products?inStock=true&limit=50').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(11);
    expect(res.body.data.every((p: any) => p.inStock)).toBe(true);
  });

  it('filters out-of-stock products', async () => {
    const res = await request(app).get('/products?inStock=false&limit=50').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data.every((p: any) => !p.inStock)).toBe(true);
  });

  it('sorts by price ascending', async () => {
    const res = await request(app).get('/products?sort=price_asc&limit=50').set(AUTH);
    const prices = res.body.data.map((p: any) => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it('sorts by price descending', async () => {
    const res = await request(app).get('/products?sort=price_desc&limit=50').set(AUTH);
    const prices = res.body.data.map((p: any) => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  it('sorts by name ascending', async () => {
    const res = await request(app).get('/products?sort=name_asc&limit=50').set(AUTH);
    const names = res.body.data.map((p: any) => p.name);
    expect(names).toEqual([...names].sort());
  });

  it('sorts by name descending', async () => {
    const res = await request(app).get('/products?sort=name_desc&limit=50').set(AUTH);
    const names = res.body.data.map((p: any) => p.name);
    expect(names).toEqual([...names].sort().reverse());
  });

  it('filters by search term', async () => {
    const res = await request(app).get('/products?search=laptop&limit=50').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data.every((p: any) => p.name.toLowerCase().includes('laptop'))).toBe(true);
  });

  it('returns empty data array when search matches nothing', async () => {
    const res = await request(app).get('/products?search=xyznonexistent&limit=50').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('returns 401 without auth header', async () => {
    const res = await request(app).get('/products');
    expect(res.status).toBe(401);
  });
});

describe('Pagination', () => {
  it('returns correct envelope shape for first page', async () => {
    const res = await request(app).get('/products?page=1&limit=5').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(5);
    expect(res.body.total).toBe(15);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(5);
    expect(res.body.totalPages).toBe(3);
  });

  it('returns a different set of products for page 2', async () => {
    const page1 = await request(app).get('/products?page=1&limit=5').set(AUTH);
    const page2 = await request(app).get('/products?page=2&limit=5').set(AUTH);
    expect(page2.body.page).toBe(2);
    expect(page2.body.data.length).toBe(5);
    expect(page2.body.data).not.toEqual(page1.body.data);
  });

  it('clamps limit to a maximum of 50', async () => {
    const res = await request(app).get('/products?limit=100').set(AUTH);
    expect(res.body.limit).toBe(50);
    expect(res.body.data.length).toBeLessThanOrEqual(50);
  });
});

describe('Auth middleware', () => {
  it('rejects a token whose digits sum to an odd number', async () => {
    const res = await request(app)
      .get('/products')
      .set('Authorization', 'Bearer invalid-111');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Unauthorized' });
  });

  it('accepts any token whose digits sum to an even number', async () => {
    const res = await request(app)
      .get('/products')
      .set('Authorization', 'Bearer custom-token-22');
    expect(res.status).toBe(200);
  });

  it('rejects a request with no Bearer prefix', async () => {
    const res = await request(app)
      .get('/products')
      .set('Authorization', 'benchmark-token-2024');
    expect(res.status).toBe(401);
  });

  it('does not apply auth to the /health route', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('Featured filter', () => {
  it('returns only featured products when featured=true', async () => {
    const res = await request(app).get('/products?featured=true&limit=50').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(4);
    expect(res.body.data.every((p: any) => p.featured === true)).toBe(true);
  });

  it('returns only non-featured products when featured=false', async () => {
    const res = await request(app).get('/products?featured=false&limit=50').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(11);
    expect(res.body.data.every((p: any) => !p.featured)).toBe(true);
  });

  it('featured=true combined with category filter returns intersection', async () => {
    const res = await request(app)
      .get('/products?featured=true&category=electronics&limit=50')
      .set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].id).toBe(1);
  });
});

describe('Rating sort', () => {
  it('sorts by rating descending when sort=rating_desc', async () => {
    const res = await request(app).get('/products?sort=rating_desc&limit=50').set(AUTH);
    expect(res.status).toBe(200);
    const ratings = res.body.data.map((p: any) => p.rating);
    expect(ratings).toEqual([...ratings].sort((a, b) => b - a));
  });
});
`
);
