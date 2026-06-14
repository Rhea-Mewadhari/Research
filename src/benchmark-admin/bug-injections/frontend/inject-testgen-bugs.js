import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../benchmark-frontend');

function write(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated: ${filePath}`);
}

// ─── Working implementations ──────────────────────────────────────────────────
// The base repo has stub implementations. Task 5 asks agents to write tests,
// so they need a real working app to test against.

write(
  path.join(repoRoot, 'src', 'utils', 'productFilters.ts'),
  `import type { Product } from '../types/product';

export type FilterState = {
  search: string;
  category: string;
  inStockOnly: boolean;
  sortBy: 'default' | 'price-asc' | 'price-desc' | 'rating-desc';
};

export function filterProducts(products: Product[], filters: FilterState): Product[] {
  let result = [...products];

  if (filters.search) {
    const term = filters.search.trim().toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(term));
  }

  if (filters.category !== 'All') {
    result = result.filter((p) => p.category === filters.category);
  }

  if (filters.inStockOnly) {
    result = result.filter((p) => p.inStock);
  }

  if (filters.sortBy === 'price-asc') {
    result = [...result].sort((a, b) => a.price - b.price);
  } else if (filters.sortBy === 'price-desc') {
    result = [...result].sort((a, b) => b.price - a.price);
  } else if (filters.sortBy === 'rating-desc') {
    result = [...result].sort((a, b) => b.rating - a.rating);
  }

  return result;
}
`
);

write(
  path.join(repoRoot, 'src', 'components', 'FilterPanel.tsx'),
  `import type { FilterState } from '../utils/productFilters';

type Props = {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  categories: string[];
};

export default function FilterPanel({ filters, onChange, categories }: Props) {
  return (
    <section aria-label="Filters" className="panel">
      <h2>Filters</h2>

      <div>
        <label htmlFor="search">Search</label>
        <input
          id="search"
          name="search"
          type="text"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search by product name"
        />
      </div>

      <div>
        <label htmlFor="category">Category</label>
        <select
          id="category"
          name="category"
          value={filters.category}
          onChange={(e) => onChange({ ...filters, category: e.target.value })}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="inStockOnly">
          <input
            id="inStockOnly"
            name="inStockOnly"
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => onChange({ ...filters, inStockOnly: e.target.checked })}
          />
          In-stock only
        </label>
      </div>

      <button
        type="button"
        onClick={() => onChange({ search: '', category: 'All', inStockOnly: false, sortBy: 'default' })}
      >
        Clear filters
      </button>
    </section>
  );
}
`
);

write(
  path.join(repoRoot, 'src', 'components', 'SortSelect.tsx'),
  `import type { FilterState } from '../utils/productFilters';

type Props = {
  value: FilterState['sortBy'];
  onChange: (sortBy: FilterState['sortBy']) => void;
};

export default function SortSelect({ value, onChange }: Props) {
  return (
    <div className="panel">
      <label htmlFor="sortBy">Sort by</label>
      <select
        id="sortBy"
        name="sortBy"
        value={value}
        onChange={(e) => onChange(e.target.value as FilterState['sortBy'])}
      >
        <option value="default">Default</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="rating-desc">Rating</option>
      </select>
    </div>
  );
}
`
);

// ─── Test file stubs ───────────────────────────────────────────────────────────
// The base repo ships with fully written test files — the answer key. Replace
// them with empty stubs so the agent has to write the tests from scratch.

const testsDir = path.join(repoRoot, 'tests');

write(
  path.join(testsDir, 'app.render.test.tsx'),
  `import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App rendering', () => {});
`
);

write(
  path.join(testsDir, 'filtering.test.tsx'),
  `import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Filtering behavior', () => {});
`
);

write(
  path.join(testsDir, 'sorting.test.tsx'),
  `import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Sorting behavior', () => {});
`
);

write(
  path.join(testsDir, 'clearFilters.test.tsx'),
  `import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Clear filters', () => {});
`
);

write(
  path.join(testsDir, 'pagination.test.tsx'),
  `import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('Pagination controls', () => {});
`
);

write(
  path.join(testsDir, 'loadingError.test.tsx'),
  `import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('Loading and error states', () => {});
`
);
