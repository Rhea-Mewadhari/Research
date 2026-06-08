import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../benchmark-backend');

function write(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated: ${filePath}`);
}

// Provide a correct productService.ts so tests pass once syntax bugs are fixed.
write(
  path.join(repoRoot, 'src', 'services', 'productService.ts'),
  `import { products } from '../data/products';
import type { Product, ProductQuery } from '../types/product';

export function getAllProducts(query: ProductQuery): Product[] {
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

  return result;
}
`
);

// BUG 1 in app.ts:
//   Wrong import path — './routes/products' does not exist (should be './routes/productRoutes').
write(
  path.join(repoRoot, 'src', 'app.ts'),
  `import express from 'express';
import cors from 'cors';
import productRoutes from './routes/products';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/products', productRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

export default app;
`
);

// BUG 2 in productController.ts:
//   res.json(result  — missing closing ')' → parse error.
write(
  path.join(repoRoot, 'src', 'controllers', 'productController.ts'),
  `import type { Request, Response } from 'express';
import { getAllProducts } from '../services/productService';
import { parseProductQuery } from '../utils/queryParser';

export const getProducts = (req: Request, res: Response): void => {
  const query = parseProductQuery(req.query as Record<string, unknown>);
  const result = getAllProducts(query);
  res.json(result
};
`
);

// BUG 3 + BUG 4 in queryParser.ts:
//   Bug 3 — query.inStock assigned the string literal 'true' instead of boolean true.
//            TypeScript error: Type '"true"' is not assignable to type 'boolean | undefined'.
//   Bug 4 — VALID_SORT_OPTIONS typed as string[] instead of SortOption[],
//            breaking the includes() type-narrowing used by the caller.
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

  return query;
}
`
);

console.log('Syntax bugs injected successfully.');
