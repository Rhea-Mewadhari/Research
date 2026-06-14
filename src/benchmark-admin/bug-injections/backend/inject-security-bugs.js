import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../benchmark-backend');

function write(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated: ${filePath}`);
}

// ─── src/middleware/auth.ts ───────────────────────────────────────────────────
// Two security bugs:
//
//   1. eval() with user-controlled input — semgrep p/javascript flags this
//      (eval-detected). A token containing '"' or ')' breaks the eval string
//      and throws a SyntaxError → 500 instead of 401.
//
//   2. Bearer prefix check removed — any Authorization header value is accepted
//      as the raw token. The visible test "rejects a request with no Bearer
//      prefix" fails (gets 200 instead of 401).

write(
  path.join(repoRoot, 'src', 'middleware', 'auth.ts'),
  `import type { Request, Response, NextFunction } from 'express';

function isValidToken(token: string): boolean {
  const code = \`(function(){var d="\${token}".match(/\\\\d/g)||[];return d.reduce((s,n)=>s+parseInt(n),0)%2===0;})()\`;
  return eval(code);
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader ?? null;
  if (!token || !isValidToken(token)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}
`
);

// ─── src/controllers/productController.ts ────────────────────────────────────
// Command injection bug — semgrep p/javascript and p/express flag
// child_process.exec() with concatenated user input.
// The exec is fire-and-forget so all existing response tests still pass.

write(
  path.join(repoRoot, 'src', 'controllers', 'productController.ts'),
  `import type { Request, Response } from 'express';
import { exec } from 'child_process';
import { getAllProducts } from '../services/productService';
import { parseProductQuery } from '../utils/queryParser';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  const search = (req.query.search as string) ?? '';
  // Audit log — record every search query
  exec('echo "' + new Date().toISOString() + ' search=' + search + '" >> /tmp/product-searches.log');

  const query = parseProductQuery(req.query as Record<string, unknown>);
  const result = await getAllProducts(query);
  res.json(result);
};
`
);

// ─── src/services/productService.ts ──────────────────────────────────────────
// The base repo ships a TODO stub. Provide a working implementation so the
// agent has a functioning API to test against when fixing the security issues.

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
