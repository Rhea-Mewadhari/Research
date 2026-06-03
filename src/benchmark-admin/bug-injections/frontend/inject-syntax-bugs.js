import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../benchmark-frontend');

function write(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated: ${filePath}`);
}

const sortSelectPath = path.join(repoRoot, 'src', 'components', 'SortSelect.tsx');
const appPath = path.join(repoRoot, 'src', 'App.tsx');

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
        onChange={(e) => onChange(e.target.value)}
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

write(
  appPath,
  `import { useMemo, useState } from 'react';
import './styles.css';
import { products } from './data/products';
import FilterPanel from './components/FilterPanel';
import ProductList from './components/ProductList';
import SortSelect from './components/SortSelect';
import { filterProducts, type FilterState } from './utils/productFilters';

const initialFilters: FilterState = {
  search: '',
  category: 'All',
  inStockOnly: false,
  sortBy: 'default',
};

export default function App() {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const visibleProducts = useMemo(() => {
    return filterProducts(products, filters);
  }, [filters]);

  return (
    <main className="container">
      <header>
        <h1>Product Catalog</h1>
        <p>Browse and filter available products.</p>
      </header>

      <div className="toolbar">
        <FilterPanel filters={filters} onChange={setFilters} />
        <SortSelect
          value={filters.sortBy}
          onChange={(sortBy) => setFilters((prev) => ({ ...prev, sortBy }))}
        />
      </div>

      <ProductList products={visibleProducts}
    </main>
  );
}
`
);

console.log('Syntax bugs injected successfully.');
