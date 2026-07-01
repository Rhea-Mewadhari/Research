import type { FilterState } from '../utils/productFilters';
import SavedFiltersPanel from './SavedFiltersPanel';

type Props = {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  onClear?: () => void;
  categories: string[];
};

export default function FilterPanel({ filters, onChange: _onChange, onClear, categories }: Props) {
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
          onChange={() => {}}
          placeholder="Search by product name"
        />
      </div>

      <div>
        <label htmlFor="category">Category</label>
        <select
          id="category"
          name="category"
          value={filters.category}
          onChange={() => {}}
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
            onChange={() => {}}
          />
          In-stock only
        </label>
      </div>

      <button type="button" onClick={() => onClear?.()}>
        Clear filters
      </button>

      <SavedFiltersPanel />
    </section>
  );
}
