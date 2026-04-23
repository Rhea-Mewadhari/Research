import { useMemo, useState } from 'react';
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

      <ProductList products={visibleProducts} />
    </main>
  );
}