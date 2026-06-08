import type { FilterState } from '../utils/productFilters';

type Props = {
  value: FilterState['sortBy'];
  onChange: (sortBy: FilterState['sortBy']) => void;
};

export default function SortSelect({ value, onChange: _onChange }: Props) {
  return (
    <div className="panel">
      <label htmlFor="sortBy">Sort by</label>
      <select
        id="sortBy"
        name="sortBy"
        value={value}
        onChange={() => {}}
      >
        <option value="default">Default</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="rating-desc">Rating</option>
      </select>
    </div>
  );
}