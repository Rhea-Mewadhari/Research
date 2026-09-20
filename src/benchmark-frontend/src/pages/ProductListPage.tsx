import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
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
    setSortBy,
    clearFilters,
  } = useFilterContext();

  const [detailProductId, setDetailProductId] = useState<string | null>(null);

  const location = useLocation();

  useLayoutEffect(() => {
    const saved = sessionStorage.getItem(`scroll-${location.key}`);
    window.scrollTo(0, saved ? parseInt(saved, 10) : 0);
  }, [location.key]);

  useEffect(() => {
    const key = location.key;
    return () => {
      sessionStorage.setItem(`scroll-${key}`, String(window.scrollY));
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
        <SortSelect value={sortBy} onChange={setSortBy} />
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
            <ProductList
              products={filteredProducts}
              onSelect={setDetailProductId}
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
