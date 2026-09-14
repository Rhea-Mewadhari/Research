import type { FilterState } from '../utils/productFilters';

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
