import { act, renderHook, waitFor } from '@testing-library/react';
import { FilterProvider, useFilterContext } from '../src/context/FilterContext';
import { ProductProvider } from '../src/context/ProductContext';
import { useFilteredProducts } from '../src/hooks/useFilteredProducts';

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ProductProvider>
      <FilterProvider>{children}</FilterProvider>
    </ProductProvider>
  );
}

// All four tests change sortBy in a separate act() call from any prior filter change
// so that useMemo deps [category, inStockOnly, debouncedSearch] are already stable
// before sortBy changes. If sortBy is missing from the dep array, the memo will not
// recompute and the sort will not be applied.

describe('Derived state correctness — useFilteredProducts', () => {
  it('price-asc sort within Fitness category produces correct order', async () => {
    const { result } = renderHook(
      () => ({
        setCategory: useFilterContext().setCategory,
        setSortBy: useFilterContext().setSortBy,
        filteredProducts: useFilteredProducts().filteredProducts,
      }),
      { wrapper: Wrapper },
    );

    await waitFor(() => expect(result.current.filteredProducts.length).toBe(15));

    // Set category first so it becomes stable before the sort change
    act(() => {
      result.current.setCategory('Fitness');
    });

    // Changing sortBy alone — must trigger recomputation
    act(() => {
      result.current.setSortBy('price-asc');
    });

    expect(result.current.filteredProducts.map((p) => p.name)).toEqual([
      'Jump Rope',       // $15
      'Foam Roller',     // $22
      'Resistance Bands', // $30
      'Yoga Mat',        // $40
      'Dumbbell Set',    // $85
    ]);
  });

  it('price-desc sort within Electronics category produces correct order', async () => {
    const { result } = renderHook(
      () => ({
        setCategory: useFilterContext().setCategory,
        setSortBy: useFilterContext().setSortBy,
        filteredProducts: useFilteredProducts().filteredProducts,
      }),
      { wrapper: Wrapper },
    );

    await waitFor(() => expect(result.current.filteredProducts.length).toBe(15));

    act(() => {
      result.current.setCategory('Electronics');
    });

    act(() => {
      result.current.setSortBy('price-desc');
    });

    const names = result.current.filteredProducts.map((p) => p.name);
    expect(names[0]).toBe('Noise-Cancelling Headphones'); // $149
    expect(names[names.length - 1]).toBe('Wireless Mouse'); // $25
  });

  it('changing sortBy alone — with no other filter changes — triggers recomputation', async () => {
    const { result } = renderHook(
      () => ({
        setSortBy: useFilterContext().setSortBy,
        filteredProducts: useFilteredProducts().filteredProducts,
      }),
      { wrapper: Wrapper },
    );

    await waitFor(() => expect(result.current.filteredProducts.length).toBe(15));

    // No prior dep change — only sortBy changes
    act(() => {
      result.current.setSortBy('price-asc');
    });

    // Jump Rope ($15) must be first; Wireless Mouse ($25) is first in insertion order
    expect(result.current.filteredProducts[0].name).toBe('Jump Rope');
  });

  it('rating-desc sort within Accessories category produces correct order', async () => {
    const { result } = renderHook(
      () => ({
        setCategory: useFilterContext().setCategory,
        setSortBy: useFilterContext().setSortBy,
        filteredProducts: useFilteredProducts().filteredProducts,
      }),
      { wrapper: Wrapper },
    );

    await waitFor(() => expect(result.current.filteredProducts.length).toBe(15));

    act(() => {
      result.current.setCategory('Accessories');
    });

    act(() => {
      result.current.setSortBy('rating-desc');
    });

    const names = result.current.filteredProducts.map((p) => p.name);
    expect(names[0]).toBe('Laptop Stand');   // 4.6
    expect(names[names.length - 1]).toBe('Desk Lamp'); // 3.9
  });
});
