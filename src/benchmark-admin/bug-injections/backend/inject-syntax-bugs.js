import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../benchmark-backend');

function write(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated: ${filePath}`);
}

// Provide a correct productService.ts (Phase 2: async, PaginatedResponse) so
// filtering tests can pass once the agent fixes the syntax bugs elsewhere.
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

  if (query.sort === 'price_asc') {
    result = [...result].sort((a, b) => a.price - b.price);
  } else if (query.sort === 'price_desc') {
    result = [...result].sort((a, b) => b.price - a.price);
  } else if (query.sort === 'name_asc') {
    result = [...result].sort((a, b) => a.name.localeCompare(b.name));
  } else if (query.sort === 'name_desc') {
    result = [...result].sort((a, b) => b.name.localeCompare(a.name));
  }

  const total = result.length;
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const totalPages = Math.ceil(total / limit);
  const data = result.slice((page - 1) * limit, page * limit);

  return { data, total, page, limit, totalPages };
}
`
);

// BUG 1 in app.ts:
//   Wrong import path — './routes/products' does not exist (should be './routes/productRoutes').
//   Phase 2 version retained: auth middleware is still applied on the /products route.
write(
  path.join(repoRoot, 'src', 'app.ts'),
  `import express from 'express';
import cors from 'cors';
import productRoutes from './routes/products';
import { requireAuth } from './middleware/auth';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/products', requireAuth, productRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

export default app;
`
);

// BUG 2 in productController.ts:
//   res.json(result  — missing closing ')' → parse error.
//   Phase 2 version retained: async controller, awaits getAllProducts.
write(
  path.join(repoRoot, 'src', 'controllers', 'productController.ts'),
  `import type { Request, Response } from 'express';
import { getAllProducts } from '../services/productService';
import { parseProductQuery } from '../utils/queryParser';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  const query = parseProductQuery(req.query as Record<string, unknown>);
  const result = await getAllProducts(query);
  res.json(result
};
`
);

// BUG 3 + BUG 4 in queryParser.ts:
//   Bug 3 — query.inStock assigned the string literal 'true' instead of boolean true.
//            TypeScript error: Type '"true"' is not assignable to type 'boolean | undefined'.
//   Bug 4 — VALID_SORT_OPTIONS typed as string[] instead of SortOption[],
//            breaking the includes() type-narrowing used by the caller.
//   Phase 2 additions (page/limit parsing) are preserved.
write(
  path.join(repoRoot, 'src', 'utils', 'queryParser.ts'),
  `import type { ProductQuery, SortOption } from '../types/product';

const VALID_SORT_OPTIONS: string[] = ['price_asc', 'price_desc', 'name_asc', 'name_desc'];

export function parseProductQuery(raw: Record<string, unknown>): ProductQuery {
  const query: ProductQuery = {};

  if (typeof raw.search === 'string') {
    query.search = raw.search;
  }

  if (typeof raw.category === 'string') {
    query.category = raw.category;
  }

  if (raw.inStock === 'true') {
    query.inStock = 'true';
  } else if (raw.inStock === 'false') {
    query.inStock = false;
  }

  if (VALID_SORT_OPTIONS.includes(raw.sort as string)) {
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

console.log('Syntax bugs injected successfully.');
