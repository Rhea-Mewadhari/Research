import { useMemo } from 'react';
import './styles/style.css';
import FilterPanel from './components/FilterPanel';
import ProductList from './components/ProductList';
import Spinner from './components/Spinner';
import SortSelect from './components/SortSelect';
import { filterProducts } from './utils/productFilters';
import type { FilterState } from './utils/productFilters';
import { useProductFilters } from './hooks/useProductFilters';

export default function App() {
  const { filters, setFilters, products, isLoading, error, page, totalPages, setPage } =
    useProductFilters();

  const categories = useMemo(
    () => ['All', ...new Set(products.map((p) => p.category))],
    [products]
  );

  const visibleProducts = useMemo(() => {
    return filterProducts(products, filters);
  }, [products, filters]);

  const handleFiltersChange = (next: FilterState) => {
    setFilters(next);
    setPage(1);
  };

  return (
    <main className="container">
      <header>
        <h1>Product Catalog</h1>
        <p>Browse and filter available products.</p>
      </header>

      <div className="toolbar">
        <FilterPanel filters={filters} onChange={handleFiltersChange} categories={categories} />
        <SortSelect
          value={filters.sortBy}
          onChange={(sortBy) => handleFiltersChange({ ...filters, sortBy })}
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
