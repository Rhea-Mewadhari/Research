import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../benchmark-frontend');

function write(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated: ${filePath}`);
}

// ProductListPage.tsx — partially migrated state:
//   - Local `localSortBy` useState shadows FilterContext.sortBy.
//     SortSelect is wired to localSortBy / setLocalSortBy, so selecting a sort option
//     updates the dropdown visually but never calls FilterContext.setSortBy.
//     useFilteredProducts reads FilterContext.sortBy which stays at 'default' forever.
//   - onCategoryClick is passed as an empty no-op down to ProductList → ProductCard,
//     so clicking a product's category button does nothing.
write(
  path.join(repoRoot, 'src', 'pages', 'ProductListPage.tsx'),
  `import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import FilterPanel from '../components/FilterPanel';
import ProductDetailPanel from '../components/ProductDetailPanel';
import ProductErrorBoundary from '../components/ProductErrorBoundary';
import ProductList from '../components/ProductList';
import Spinner from '../components/Spinner';
import SortSelect from '../components/SortSelect';
import { useFilterContext } from '../context/FilterContext';
import { useProductContext } from '../context/ProductContext';
import { useFilteredProducts } from '../hooks/useFilteredProducts';
import type { SortOption } from '../types/product';
import { type FilterState } from '../utils/productFilters';

export default function ProductListPage() {
  const { products, isLoading, error, page, totalPages, setPage } = useProductContext();
  const {
    search,
    category,
    inStockOnly,
    sortBy,
    setSearch,
    setCategory,
    setInStockOnly,
    clearFilters,
  } = useFilterContext();

  const [detailProductId, setDetailProductId] = useState<string | null>(null);
  // BUG: local sort state duplicates FilterContext.sortBy — SortSelect is wired here
  // instead of to FilterContext, so sort changes never reach useFilteredProducts.
  const [localSortBy, setLocalSortBy] = useState<SortOption>('default');

  const location = useLocation();

  useLayoutEffect(() => {
    const saved = sessionStorage.getItem(\`scroll-\${location.key}\`);
    window.scrollTo(0, saved ? parseInt(saved, 10) : 0);
  }, [location.key]);

  useEffect(() => {
    const key = location.key;
    return () => {
      sessionStorage.setItem(\`scroll-\${key}\`, String(window.scrollY));
    };
  }, [location.key]);

  const categories = useMemo(
    () => ['All', ...new Set(products.map((p) => p.category))],
    [products],
  );

  const filters: FilterState = { search, category, inStockOnly, sortBy };

  const handleFiltersChange = useCallback(
    (next: FilterState) => {
      setSearch(next.search);
      setCategory(next.category);
      setInStockOnly(next.inStockOnly);
    },
    [setSearch, setCategory, setInStockOnly],
  );

  const { filteredProducts, resultCount } = useFilteredProducts();

  return (
    <main className="container">
      <header>
        <h1>Product Catalog</h1>
        <p>Browse and filter available products.</p>
      </header>

      <div className="toolbar">
        <FilterPanel
          filters={filters}
          onChange={handleFiltersChange}
          onClear={clearFilters}
          categories={categories}
        />
        {/* BUG: wired to localSortBy, not FilterContext.sortBy / setSortBy */}
        <SortSelect value={localSortBy} onChange={setLocalSortBy} />
      </div>

      {isLoading ? (
        <Spinner />
      ) : error ? (
        <p role="alert">{error}</p>
      ) : (
        <>
          <p data-testid="results-count">
            Showing {resultCount} products (page {page} of {totalPages})
          </p>
          <ProductErrorBoundary>
            {/* BUG: onCategoryClick is a no-op — category clicks do nothing */}
            <ProductList
              products={filteredProducts}
              onSelect={setDetailProductId}
              onCategoryClick={() => {}}
            />
          </ProductErrorBoundary>
          <div className="pagination">
            <button type="button" onClick={() => setPage(page - 1)} disabled={page <= 1}>
              Prev
            </button>
            <button type="button" onClick={() => setPage(page + 1)} disabled={page >= totalPages}>
              Next
            </button>
          </div>
        </>
      )}

      <ProductDetailPanel
        productId={detailProductId}
        onClose={() => setDetailProductId(null)}
      />
    </main>
  );
}
`
);

// ProductList.tsx — drills onCategoryClick through to ProductCard
write(
  path.join(repoRoot, 'src', 'components', 'ProductList.tsx'),
  `import type { Product } from '../types/product';
import ProductCard from './ProductCard';

type Props = {
  products: Product[];
  onSelect?: (id: string) => void;
  onCategoryClick?: (category: string) => void;
};

export default function ProductList({ products, onSelect, onCategoryClick }: Props) {
  if (products.length === 0) {
    return <p role="status">No products found.</p>;
  }

  return (
    <section aria-label="Product results">
      <div className="grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onSelect={onSelect}
            onCategoryClick={onCategoryClick}
          />
        ))}
      </div>
    </section>
  );
}
`
);

// ProductCard.tsx — receives onCategoryClick prop, renders category as a clickable button.
// The button fires onCategoryClick(product.category) on click — but since the callback
// is a no-op from ProductListPage, clicking does nothing until the migration is completed.
write(
  path.join(repoRoot, 'src', 'components', 'ProductCard.tsx'),
  `import type { Product } from '../types/product';
import { formatPrice, formatRating, truncate } from '../utils/formatters';
import FavouriteButton from './FavouriteButton';
import { useComparisonContext } from '../context/ComparisonContext';

type Props = {
  product: Product;
  onSelect?: (id: string) => void;
  onCategoryClick?: (category: string) => void;
};

export default function ProductCard({ product, onSelect, onCategoryClick }: Props) {
  const { isCompared, addToComparison, removeFromComparison } = useComparisonContext();
  const productId = String(product.id);
  const hasDiscount = product.discountPct != null;
  const compared = isCompared(productId);

  return (
    <article
      className="card"
      data-testid={\`product-\${product.id}\`}
      onClick={() => onSelect?.(productId)}
      style={{ cursor: onSelect ? 'pointer' : undefined }}
    >
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
            <span className="badge badge-discount">-{product.discountPct}%</span>
          )}
          <FavouriteButton productId={productId} />
        </div>

        <button
          type="button"
          className="card-category category-filter-btn"
          aria-label={\`Filter by \${product.category}\`}
          onClick={(e) => {
            e.stopPropagation();
            onCategoryClick?.(product.category);
          }}
        >
          {product.category}
        </button>

        <p className="card-description">{truncate(product.description)}</p>

        <div className="card-price">
          {hasDiscount && (
            <span className="price-original">\${product.price}</span>
          )}
          <span className="price-current">{formatPrice(product.price, product.discountPct)}</span>
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

        <button
          type="button"
          aria-pressed={compared}
          aria-label={compared ? \`Remove \${product.name} from comparison\` : \`Add \${product.name} to comparison\`}
          className={\`compare-btn\${compared ? ' is-compared' : ''}\`}
          onClick={(e) => {
            e.stopPropagation();
            compared ? removeFromComparison(productId) : addToComparison(productId);
          }}
        >
          {compared ? 'Remove from compare' : 'Compare'}
        </button>
      </div>
    </article>
  );
}
`
);
