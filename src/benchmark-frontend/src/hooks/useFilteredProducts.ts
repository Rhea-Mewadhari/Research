import { useMemo } from 'react';
import { useProductContext } from '../context/ProductContext';
import { useFilterContext } from '../context/FilterContext';
import type { Product } from '../types/product';

interface UseFilteredProductsResult {
  filteredProducts: Product[];
  resultCount: number;
}

export function useFilteredProducts(): UseFilteredProductsResult {
  const { products } = useProductContext();
  const { debouncedSearch, category, inStockOnly, sortBy } = useFilterContext();

  const filteredProducts = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();

    let result: Product[] = products;

    if (term) {
      result = result.filter((p) => p.name.toLowerCase().includes(term));
    }
    if (category !== 'All') {
      result = result.filter((p) => p.category === category);
    }
    if (inStockOnly) {
      result = result.filter((p) => p.inStock);
    }

    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating-desc') {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, debouncedSearch, category, inStockOnly, sortBy]);

  return { filteredProducts, resultCount: filteredProducts.length };
}
