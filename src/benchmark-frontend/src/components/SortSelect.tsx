import type { FilterState } from '../utils/productFilters';

type Props = {
  value: FilterState['sortBy'];
  onChange: (sortBy: FilterState['sortBy']) => void;
};

const SORT_LABELS: Record<FilterState['sortBy'], string> = {
  default: 'Default',
  'price-asc': 'Price: Low to High',
  'price-desc': 'Price: High to Low',
  'rating-desc': 'Rating',
};

export default function SortSelect({ value, onChange }: Props) {
  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selected = e.target.value as FilterState['sortBy'];
    onChange(selected);
  }

  return (
    <div className="panel">
      <label htmlFor="sortBy">Sort by</label>
      <select
        id="sortBy"
        name="sortBy"
        value={value}
        onChange={handleChange}
        title={SORT_LABELS[value]}
      >
        <option value="default">Default</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="rating-desc">Rating</option>
      </select>
    </div>
  );
}
