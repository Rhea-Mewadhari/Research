import '@testing-library/jest-dom/vitest';
import { vi, beforeEach, afterEach } from 'vitest';
import { products } from '../src/data/products';

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [...products],
        total: products.length,
        page: 1,
        limit: products.length,
        totalPages: 1,
      }),
    })
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});
