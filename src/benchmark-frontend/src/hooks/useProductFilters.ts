import { useState, useCallback, useEffect } from 'react';
import { fetchProducts } from '../api/productsApi';
import type { FilterState } from '../utils/productFilters';
import type { Product } from '../types/product';

const initialFilters: FilterState = {
  search: '',
  category: 'All',
  inStockOnly: false,
  sortBy: 'default',
};

export function useProductFilters() {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setIsLoading(true);
    fetchProducts(page)
      .then((response) => {
        setProducts(response.data);
        setTotalPages(response.totalPages);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load products');
        setIsLoading(false);
      });
  }, [page]);

  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const clearFilters = useCallback(() => setFilters(initialFilters), []);

  return { filters, setFilters, updateFilter, clearFilters, products, isLoading, error, page, totalPages, setPage };
}
