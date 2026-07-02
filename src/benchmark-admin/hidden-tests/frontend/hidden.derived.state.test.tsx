import { act, renderHook, waitFor } from '@testing-library/react';
import { FilterProvider, useFilterContext } from '../../../benchmark-frontend/src/context/FilterContext';
import { ProductProvider, useProductContext } from '../../../benchmark-frontend/src/context/ProductContext';
import { useFilteredProducts } from '../../../benchmark-frontend/src/hooks/useFilteredProducts';

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ProductProvider>
      <FilterProvider>{children}</FilterProvider>
    </ProductProvider>
  );
}

// ---------------------------------------------------------------------------
// Source array mutation (Bug 2)
//
// When Bug 3 (missing dep) is fixed, the sort runs. If Bug 2 (mutation) is
// also present, products.sort() reorders the context's array in-place.
// This test fails when Bug 3 is fixed but Bug 2 is not.
// ---------------------------------------------------------------------------

describe('Hidden: derived state — source array mutation', () => {
  it('sorting does not mutate the products array held by ProductContext', async () => {
    const { result } = renderHook(
      () => ({
        products: useProductContext().products,
        setSortBy: useFilterContext().setSortBy,
        filteredProducts: useFilteredProducts().filteredProducts,
      }),
      { wrapper: Wrapper },
    );

    await waitFor(() => expect(result.current.products.length).toBe(15));

    // Snapshot the insertion-order id sequence before any sort runs
    const originalIds = result.current.products.map((p) => p.id);

    // Trigger a sort — if Bug 2 is present this mutates the context array
    act(() => {
      result.current.setSortBy('price-asc');
    });

    // The products array in ProductContext must still be in insertion order
    expect(result.current.products.map((p) => p.id)).toEqual(originalIds);

    // Separately verify the sorted output is correct
    expect(result.current.filteredProducts[0].name).toBe('Jump Rope'); // cheapest ($15)
  });

  it('clearing sort after applying it restores the original insertion order', async () => {
    // This is the mutation trap.
    //
    // If products.sort() mutated the context array, switching back to the default
    // sort will produce a memo result built on the mutated (already-sorted) array.
    // The first product will be Jump Rope ($15) instead of Wireless Mouse (insertion order).
    const { result } = renderHook(
      () => ({
        setSortBy: useFilterContext().setSortBy,
        filteredProducts: useFilteredProducts().filteredProducts,
      }),
      { wrapper: Wrapper },
    );

    await waitFor(() => expect(result.current.filteredProducts.length).toBe(15));

    // Apply a sort — mutates if Bug 2 is present
    act(() => {
      result.current.setSortBy('price-asc');
    });

    // Return to default (no sort)
    act(() => {
      result.current.setSortBy('default');
    });

    // Original insertion order: Wireless Mouse is first (id 1)
    expect(result.current.filteredProducts[0].name).toBe('Wireless Mouse');
    // Jump Rope is 10th in insertion order (id 10)
    expect(result.current.filteredProducts.findIndex((p) => p.name === 'Jump Rope')).toBe(9);
  });
});

// ---------------------------------------------------------------------------
// stale memo when only sortBy changes (Bug 3)
// ---------------------------------------------------------------------------

describe('Hidden: derived state — sortBy in memo dependency array', () => {
  it('inStockOnly filter + price-asc sort yields correct sorted in-stock products', async () => {
    const { result } = renderHook(
      () => ({
        setInStockOnly: useFilterContext().setInStockOnly,
        setSortBy: useFilterContext().setSortBy,
        filteredProducts: useFilteredProducts().filteredProducts,
      }),
      { wrapper: Wrapper },
    );

    await waitFor(() => expect(result.current.filteredProducts.length).toBe(15));

    // Apply inStockOnly first so it becomes a stable dep before sortBy changes
    act(() => {
      result.current.setInStockOnly(true);
    });

    act(() => {
      result.current.setSortBy('price-asc');
    });

    // Jump Rope ($15) is the cheapest in-stock product
    expect(result.current.filteredProducts[0].name).toBe('Jump Rope');
    // All returned products must be in stock
    expect(result.current.filteredProducts.every((p) => p.inStock)).toBe(true);
  });

  it('all 15 products are ordered correctly by price-desc when sortBy changes alone', async () => {
    const { result } = renderHook(
      () => ({
        setSortBy: useFilterContext().setSortBy,
        filteredProducts: useFilteredProducts().filteredProducts,
      }),
      { wrapper: Wrapper },
    );

    await waitFor(() => expect(result.current.filteredProducts.length).toBe(15));

    // No other dep change — only sortBy
    act(() => {
      result.current.setSortBy('price-desc');
    });

    const names = result.current.filteredProducts.map((p) => p.name);
    // Most expensive first
    expect(names[0]).toBe('Noise-Cancelling Headphones'); // $149
    expect(names[1]).toBe('Mechanical Keyboard');         // $95
    // Cheapest last
    expect(names[names.length - 1]).toBe('Jump Rope');   // $15
  });
});
