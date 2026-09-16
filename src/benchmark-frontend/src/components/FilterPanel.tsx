import type { FilterState } from '../utils/productFilters';

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
    onChange({ ...filters, category: e.target.value });
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
