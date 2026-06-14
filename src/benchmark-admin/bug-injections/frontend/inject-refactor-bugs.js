import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../benchmark-frontend');

function write(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated: ${filePath}`);
}

// productFilters.ts — working but messy:
//   - Dead exported helper `normalizeSearch` not used anywhere
//   - Redundant `=== true` boolean check
//   - Sort creates an unnecessary `sorted` copy with multiple early returns
//     instead of a single else-if chain returning once
write(
  path.join(repoRoot, 'src', 'utils', 'productFilters.ts'),
  `import type { Product } from '../types/product';

export type FilterState = {
  search: string;
  category: string;
  inStockOnly: boolean;
  sortBy: 'default' | 'price-asc' | 'price-desc' | 'rating-desc';
};

// normalizeSearch — was used during early development, never cleaned up
export function normalizeSearch(val: string): string {
  return val.trim().toLowerCase();
}

export function filterProducts(products: Product[], filters: FilterState): Product[] {
  let result = [...products];

  if (filters.search.trim() !== '') {
    const searchTerm = filters.search.trim().toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(searchTerm));
  }

  if (filters.category !== 'All') {
    result = result.filter((p) => p.category === filters.category);
  }

  if (filters.inStockOnly === true) {
    result = result.filter((p) => p.inStock === true);
  }

  const sorted = [...result];
  if (filters.sortBy === 'price-asc') {
    sorted.sort((a, b) => a.price - b.price);
    return sorted;
  }
  if (filters.sortBy === 'price-desc') {
    sorted.sort((a, b) => b.price - a.price);
    return sorted;
  }
  if (filters.sortBy === 'rating-desc') {
    sorted.sort((a, b) => b.rating - a.rating);
    return sorted;
  }

  return result;
}
`
);

// App.tsx — working but messy:
//   - Imports filterProducts but never calls it (dead import)
//   - Duplicates all filtering and sorting logic inline in useMemo
//   - Filter step uses nested if-guards inside a single .filter() instead of
//     chained .filter() calls — harder to read and extend
//   - filters.search.trim() computed twice inside the callback
//   - Sort uses separate if branches that each mutate+reassign instead of a
//     single conditional sort
write(
  path.join(repoRoot, 'src', 'App.tsx'),
  `import { useMemo } from 'react';
import './styles/style.css';
import FilterPanel from './components/FilterPanel';
import ProductList from './components/ProductList';
import Spinner from './components/Spinner';
import SortSelect from './components/SortSelect';
import { filterProducts } from './utils/productFilters';
import { useProductFilters } from './hooks/useProductFilters';

export default function App() {
  const { filters, setFilters, products, isLoading, error, page, totalPages, setPage } =
    useProductFilters();

  const categories = useMemo(
    () => ['All', ...new Set(products.map((p) => p.category))],
    [products]
  );

  const visibleProducts = useMemo(() => {
    let data = products.filter((p) => {
      if (filters.search.trim()) {
        if (!p.name.toLowerCase().includes(filters.search.trim().toLowerCase())) return false;
      }
      if (filters.category !== 'All') {
        if (p.category !== filters.category) return false;
      }
      if (filters.inStockOnly) {
        if (!p.inStock) return false;
      }
      return true;
    });

    if (filters.sortBy === 'price-asc') {
      data = [...data].sort((a, b) => a.price - b.price);
    }
    if (filters.sortBy === 'price-desc') {
      data = [...data].sort((a, b) => b.price - a.price);
    }
    if (filters.sortBy === 'rating-desc') {
      data = [...data].sort((a, b) => b.rating - a.rating);
    }

    return data;
  }, [products, filters]);

  return (
    <main className="container">
      <header>
        <h1>Product Catalog</h1>
        <p>Browse and filter available products.</p>
      </header>

      <div className="toolbar">
        <FilterPanel filters={filters} onChange={setFilters} categories={categories} />
        <SortSelect
          value={filters.sortBy}
          onChange={(sortBy) => setFilters((prev) => ({ ...prev, sortBy }))}
        />
      </div>

      {isLoading ? (
        <Spinner />
      ) : error ? (
        <p role="alert">{error}</p>
      ) : (
        <>
          <p data-testid="results-count">
            Showing {visibleProducts.length} products (page {page} of {totalPages})
          </p>
          <ProductList products={visibleProducts} />
          <div className="pagination">
            <button
              type="button"
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1}
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </main>
  );
}
`
);

// FilterPanel.tsx — working but messy:
//   - handleCategoryChange has a dead normalisation branch ('all' → 'All') that
//     can never fire because option values always come from the categories prop
//     which already contains 'All' capitalised
//   - handleClear hardcodes the reset shape here in the component; that knowledge
//     belongs in App or the hook, not in a presentational component
//   - Three separate one-liner handlers add noise; they could be inlined or
//     consolidated through the existing FilterState shape
write(
  path.join(repoRoot, 'src', 'components', 'FilterPanel.tsx'),
  `import type { FilterState } from '../utils/productFilters';

type Props = {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  categories: string[];
};

export default function FilterPanel({ filters, onChange, categories }: Props) {
  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...filters, search: e.target.value });
  }

  function handleCategoryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const cat = e.target.value === 'all' ? 'All' : e.target.value;
    onChange({ ...filters, category: cat });
  }

  function handleStockChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...filters, inStockOnly: e.target.checked });
  }

  function handleClear() {
    onChange({ search: '', category: 'All', inStockOnly: false, sortBy: 'default' });
  }

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
          onChange={handleSearchChange}
          placeholder="Search by product name"
        />
      </div>

      <div>
        <label htmlFor="category">Category</label>
        <select
          id="category"
          name="category"
          value={filters.category}
          onChange={handleCategoryChange}
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
            onChange={handleStockChange}
          />
          In-stock only
        </label>
      </div>

      <button type="button" onClick={handleClear}>
        Clear filters
      </button>
    </section>
  );
}
`
);

// SortSelect.tsx — working but messy:
//   - SORT_LABELS duplicates the text already in the option elements and is only
//     used to set a title attribute — no real value, should be removed
//   - onChange handler is unnecessarily verbose for a one-liner cast
write(
  path.join(repoRoot, 'src', 'components', 'SortSelect.tsx'),
  `import type { FilterState } from '../utils/productFilters';

type Props = {
  value: FilterState['sortBy'];
  onChange: (sortBy: FilterState['sortBy']) => void;
};

const SORT_LABELS: Record<FilterState['sortBy'], string> = {
  default: 'Default',
  'price-asc': 'Price: Low to High',
  'price-desc': 'Price: High to Low',
  'rating-desc': 'Rating',
};

export default function SortSelect({ value, onChange }: Props) {
  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selected = e.target.value as FilterState['sortBy'];
    onChange(selected);
  }

  return (
    <div className="panel">
      <label htmlFor="sortBy">Sort by</label>
      <select
        id="sortBy"
        name="sortBy"
        value={value}
        onChange={handleChange}
        title={SORT_LABELS[value]}
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
