import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../benchmark-backend');

function write(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated: ${filePath}`);
}

// ─── vitest.config.ts ─────────────────────────────────────────────────────────
// Three bugs:
//   1. globals: false  → describe/it/expect are undefined at test runtime
//   2. setupFiles points to ./src/tests/setup.ts (does not exist)
//      → fetch is never stubbed, tests call the real DummyJSON API and fail
//   3. include: ['src/**/*.spec.ts']
//      → tests in tests/visible/ (*.test.ts) are never discovered

write(
  path.join(repoRoot, 'vitest.config.ts'),
  `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/**/*.spec.ts'],
  },
});
`
);

// ─── tsconfig.json ────────────────────────────────────────────────────────────
// moduleResolution "node" conflicts with allowImportingTsExtensions.
// tsc -p tsconfig.build.json emits:
//   TS5095: Option 'allowImportingTsExtensions' can only be used when
//   'moduleResolution' is set to 'node16', 'nodenext', or 'bundler'.

write(
  path.join(repoRoot, 'tsconfig.json'),
  `{
  "compilerOptions": {
    "target": "es2023",
    "module": "esnext",
    "lib": ["ES2023"],
    "types": ["vitest/globals"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "node",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
`
);

// ─── src/services/productService.ts ──────────────────────────────────────────
// Not part of this task's bug surface — task4 tests config/build fixes only.
// Written explicitly (rather than left to whatever the base branch happens to
// have) so this task never depends on productService.ts already being
// implemented there: a fully working, unmessy implementation, matching the
// pre-refactor reference in inject-refactor-bugs.js minus its deliberately
// introduced dead code and inline-mess, so this task tests only the config
// fixes it's meant to.

write(
  path.join(repoRoot, 'src', 'services', 'productService.ts'),
  `import { fetchAllProducts } from './dataFetcher';
import type { Product, ProductQuery, PaginatedResponse } from '../types/product';

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
    result = result.filter((p) => p.inStock === query.inStock);
  }

  switch (query.sort) {
    case 'price_asc':
      result = [...result].sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      result = [...result].sort((a, b) => b.price - a.price);
      break;
    case 'name_asc':
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name_desc':
      result = [...result].sort((a, b) => b.name.localeCompare(a.name));
      break;
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

// ─── src/server.ts ────────────────────────────────────────────────────────────
// PORT has no numeric fallback — Number(undefined) === NaN.
// The server silently passes NaN to app.listen(), which Node.js accepts
// but binds to an OS-assigned ephemeral port rather than 3001.

write(
  path.join(repoRoot, 'src', 'server.ts'),
  `import app from "./app";

const PORT = Number(process.env.PORT);

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`
);
