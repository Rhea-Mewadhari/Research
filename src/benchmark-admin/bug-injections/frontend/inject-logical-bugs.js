import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../benchmark-frontend');

function write(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated: ${filePath}`);
}

const productFiltersPath = path.join(repoRoot, 'src', 'utils', 'productFilters.ts');
const filterPanelPath = path.join(repoRoot, 'src', 'components', 'FilterPanel.tsx');
const sortSelectPath = path.join(repoRoot, 'src', 'components', 'SortSelect.tsx');

write(
  productFiltersPath,
  `import type { Product } from '../types/product';

export type FilterState = {
  search: string;
  category: string;
  inStockOnly: boolean;
  sortBy: 'default' | 'price-asc' | 'price-desc' | 'rating-desc';
};

export function filterProducts(products: Product[], filters: FilterState): Product[] {
  let result = [...products];

  // BUG 1: sort before filtering
  if (filters.sortBy === 'price-asc') {
    result.sort((a, b) => a.price - b.price);
  } else if (filters.sortBy === 'price-desc') {
    result.sort((a, b) => b.price - a.price);
  } else if (filters.sortBy === 'rating-desc') {
    result.sort((a, b) => b.rating - a.rating);
  }

  // BUG 2: search is case-sensitive and does not trim
  if (filters.search) {
    result = result.filter((product) => product.name.includes(filters.search));
  }

  if (filters.category !== 'All') {
    result = result.filter((product) => product.category === filters.category);
  }

  if (filters.inStockOnly) {
    result = result.filter((product) => product.inStock);
  }

  return result;
}
`
);

write(
  filterPanelPath,
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
          onChange={(e) =>
            onChange({
              ...filters,
              category: e.target.value,
            })
          }
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
            onChange={(e) =>
              onChange({
                ...filters,
                inStockOnly: e.target.checked,
              })
            }
          />
          In-stock only
        </label>
      </div>

      <button
        type="button"
        onClick={() =>
          // BUG 3: clear filters does not reset sortBy
          onChange({
            ...filters,
            search: '',
            category: 'All',
            inStockOnly: false,
          })
        }
      >
        Clear filters
      </button>
    </section>
  );
}
`
);

// Provide a working SortSelect so the agent only needs to fix the logical bugs
// rather than also implement the sort handler from scratch.
write(
  sortSelectPath,
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

console.log('Logical bugs injected successfully.');
