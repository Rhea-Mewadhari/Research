import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../benchmark-frontend');

function write(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated: ${filePath}`);
}

// Provide a correct productFilters implementation so filtering tests can pass
// once the agent fixes the syntax bugs (productFilters itself has no bugs here).
write(
  path.join(repoRoot, 'src', 'utils', 'productFilters.ts'),
  `import type { Product, Category } from '../types/product';

export type FilterState = {
  search: string;
  category: 'All' | Category;
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

// Provide a correct FilterPanel so interactions work once syntax bugs are fixed.
write(
  path.join(repoRoot, 'src', 'components', 'FilterPanel.tsx'),
  `import type { Category } from '../types/product';
import type { FilterState } from '../utils/productFilters';

type Props = {
  filters: FilterState;
  onChange: (next: FilterState) => void;
};

const categories: Array<'All' | Category> = ['All', 'Electronics', 'Fitness', 'Accessories'];

export default function FilterPanel({ filters, onChange }: Props) {
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
              category: e.target.value as FilterState['category'],
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
          onChange({
            search: '',
            category: 'All',
            inStockOnly: false,
            sortBy: 'default',
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

// BUG 1 + BUG 2 in App.tsx:
//   Bug 1 — wrong CSS import path ('./styles.css' should be './styles/style.css')
//   Bug 2 — <ProductList> missing closing '/>' (JSX syntax error)
write(
  path.join(repoRoot, 'src', 'App.tsx'),
  `import { useMemo } from 'react';
import './styles.css';
import { products } from './data/products';
import FilterPanel from './components/FilterPanel';
import ProductList from './components/ProductList';
import SortSelect from './components/SortSelect';
import { filterProducts } from './utils/productFilters';
import { useProductFilters } from './hooks/useProductFilters';

export default function App() {
  const { filters, setFilters } = useProductFilters();

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

// BUG 3 in SortSelect.tsx:
//   e.target.value is typed as string; passing it directly to onChange violates
//   the FilterState['sortBy'] constraint — TypeScript type error.
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

// BUG 4 in ProductCard.tsx:
//   'discountPercent' does not exist on Product — the field is 'discountPct'.
//   Simulates a property rename that was not fully propagated.
write(
  path.join(repoRoot, 'src', 'components', 'ProductCard.tsx'),
  `import type { Product } from '../types/product';
import { formatPrice, formatRating, truncate } from '../utils/formatters';

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const hasDiscount = product.discountPercent != null;

  return (
    <article className="card" data-testid={\`product-\${product.id}\`}>
      <div className="card-image">
        <img
          src={\`/images/\${product.name.toLowerCase().replace(/\\s+/g, '-')}.jpg\`}
          alt={product.name}
          loading="lazy"
        />
      </div>

      <div className="card-body">
        <div className="card-header">
          <h3 className="card-title">{product.name}</h3>
          {hasDiscount && (
            <span className="badge badge-discount">-{product.discountPercent}%</span>
          )}
        </div>

        <p className="card-category">{product.category}</p>

        <p className="card-description">{truncate(product.description)}</p>

        <div className="card-price">
          {hasDiscount && (
            <span className="price-original">${product.price}</span>
          )}
          <span className="price-current">{formatPrice(product.price, product.discountPercent)}</span>
        </div>

        <p className="card-rating">{formatRating(product.rating, product.reviewCount)}</p>

        <div className="card-tags" aria-label="Tags">
          {product.tags.map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>

        <p className={\`card-stock \${product.inStock ? 'in-stock' : 'out-of-stock'}\`}>
          {product.inStock ? 'In Stock' : 'Out of Stock'}
        </p>
      </div>
    </article>
  );
}
`
);

console.log('Syntax bugs injected successfully.');
