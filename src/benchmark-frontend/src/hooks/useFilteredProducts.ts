import { useMemo } from 'react';
import { useProductContext } from '../context/ProductContext';
import { useFilterContext } from '../context/FilterContext';
import { filterProducts } from '../utils/productFilters';
import type { Product } from '../types/product';

interface UseFilteredProductsResult {
  filteredProducts: Product[];
  resultCount: number;
}

export function useFilteredProducts(): UseFilteredProductsResult {
  const { products } = useProductContext();
  const { debouncedSearch, category, inStockOnly, sortBy } = useFilterContext();

  const filteredProducts = useMemo(
    () => filterProducts(products, { search: debouncedSearch, category, inStockOnly, sortBy }),
    [products, debouncedSearch, category, inStockOnly, sortBy],
  );

  return { filteredProducts, resultCount: filteredProducts.length };
}
