import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../benchmark-backend');

function write(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated: ${filePath}`);
}

// Inject a complete but logically broken productService.ts.
// Bugs:
//   1. let result = products  — no spread copy, mutation risk across requests
//   2. Case-sensitive search with no whitespace trim
//   3. category filter resets `result` to the full dataset, discarding prior filters
//   4. Sorting applied before filtering
//   5. name_desc sort is incorrect (uses localeCompare but in wrong direction)
write(
  path.join(repoRoot, 'src', 'services', 'productService.ts'),
  `import { products } from '../data/products';
import type { Product, ProductQuery } from '../types/product';

export function getAllProducts(query: ProductQuery): Product[] {
  let result = products; // BUG 1: no copy — mutates the shared array

  // BUG 4: sorting before filtering
  if (query.sort === 'price_asc') {
    result.sort((a, b) => a.price - b.price);
  } else if (query.sort === 'price_desc') {
    result.sort((a, b) => b.price - a.price);
  } else if (query.sort === 'name_asc') {
    result.sort((a, b) => a.name.localeCompare(b.name));
  } else if (query.sort === 'name_desc') {
    result.sort((a, b) => a.name.localeCompare(b.name)); // BUG 5: same as name_asc
  }

  // BUG 2: case-sensitive search, no trim
  if (query.search) {
    result = result.filter((p) => p.name.includes(query.search!));
  }

  // BUG 3: resets result to full dataset, discarding search filter
  if (query.category) {
    result = products.filter((p) => p.category === query.category);
  }

  if (query.inStock !== undefined) {
    result = result.filter((p) => p.inStock === query.inStock);
  }

  return result;
}
`
);

console.log('Logical bugs injected successfully.');
