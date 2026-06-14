import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../benchmark-backend');

function write(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated: ${filePath}`);
}

// productService.ts — fully working but structurally messy:
//   - All filtering and sorting logic inlined in getAllProducts (no helpers)
//   - Dead exported helper sanitizeSearch that is never called externally
//   - Redundant boolean checks (=== true, !== undefined)
//   - Sort logic uses separate if blocks instead of a consistent else-if chain,
//     and unnecessarily spreads result inside each branch
//   - Redundant DEFAULT_LIMIT constant defined and never used
write(
  path.join(repoRoot, 'src', 'services', 'productService.ts'),
  `import { fetchAllProducts } from './dataFetcher';
import type { Product, ProductQuery, PaginatedResponse } from '../types/product';

const DEFAULT_LIMIT = 10;

// sanitizeSearch — was used during development, never cleaned up
export function sanitizeSearch(term: string): string {
  return term.trim().toLowerCase();
}

export async function getAllProducts(query: ProductQuery): Promise<PaginatedResponse<Product>> {
  const products = await fetchAllProducts();
  let result = [...products];

  if (query.search !== undefined) {
    const term = query.search.trim().toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(term));
  }

  if (query.category !== undefined) {
    result = result.filter(
      (p) => p.category.toLowerCase() === query.category!.toLowerCase()
    );
  }

  if (query.inStock !== undefined) {
    if (query.inStock === true) {
      result = result.filter((p) => p.inStock === true);
    } else {
      result = result.filter((p) => p.inStock === false);
    }
  }

  if (query.sort === 'price_asc') {
    result = [...result].sort((a, b) => a.price - b.price);
  }
  if (query.sort === 'price_desc') {
    result = [...result].sort((a, b) => b.price - a.price);
  }
  if (query.sort === 'name_asc') {
    result = [...result].sort((a, b) => a.name.localeCompare(b.name));
  }
  if (query.sort === 'name_desc') {
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
