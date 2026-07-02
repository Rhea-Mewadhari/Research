import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../benchmark-frontend');

function write(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated: ${filePath}`);
}

// useFilteredProducts.ts — three bugs introduced:
//
//   BUG 1: Sort is applied BEFORE filtering. The implementation sorts the full
//          product list first, then applies category / search / inStock filters.
//          The correct order is: filter first, sort the result.
//          With the current fixture data (globally unique prices and ratings) the
//          visible output is identical either way, but the dependency is wrong.
//
//   BUG 2: products.sort() mutates the source array from ProductContext.
//          Array.prototype.sort sorts in-place, so after the first sort call the
//          context's products reference is permanently reordered. Subsequent
//          filter changes then operate on a mutated base array. The fix is to
//          spread first: [...products].sort(...).
//
//   BUG 3: sortBy is missing from the useMemo dependency array.
//          When only the sort option changes (no category / search / inStock change),
//          React skips recomputing the memo and the displayed order stays stale.
//          Adding sortBy to the dep array is necessary but not sufficient — it also
//          exposes Bug 2, because the sort now actually runs and mutates products.
//
// The filterProducts utility (src/utils/productFilters.ts) is NOT modified.
// Its correct filter-then-sort, non-mutating implementation remains available as a
// reference or delegation target if the agent chooses to use it.
write(
  path.join(repoRoot, 'src', 'hooks', 'useFilteredProducts.ts'),
  `import { useMemo } from 'react';
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

    // BUG 1: sort is applied before filtering.
    //        Correct order: filter first, then sort the result.
    // BUG 2: products.sort() mutates the array reference stored in ProductContext.
    //        Use [...products].sort(...) to sort a copy instead.
    let result: Product[] = products;
    if (sortBy === 'price-asc') {
      result = products.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result = products.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating-desc') {
      result = products.sort((a, b) => b.rating - a.rating);
    }

    if (term) {
      result = result.filter((p) => p.name.toLowerCase().includes(term));
    }
    if (category !== 'All') {
      result = result.filter((p) => p.category === category);
    }
    if (inStockOnly) {
      result = result.filter((p) => p.inStock);
    }

    return result;
    // BUG 3: sortBy is missing from the dependency array.
    //        Sort changes do not trigger recomputation until another dep changes.
  }, [products, debouncedSearch, category, inStockOnly]);

  return { filteredProducts, resultCount: filteredProducts.length };
}
`,
);

console.log('Derived state bugs injected successfully.');
