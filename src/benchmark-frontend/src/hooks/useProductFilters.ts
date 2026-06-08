import { useState, useCallback } from 'react';
import type { FilterState } from '../utils/productFilters';

const initialFilters: FilterState = {
  search: '',
  category: 'All',
  inStockOnly: false,
  sortBy: 'default',
};

export function useProductFilters() {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const clearFilters = useCallback(() => setFilters(initialFilters), []);

  return { filters, setFilters, updateFilter, clearFilters };
}
