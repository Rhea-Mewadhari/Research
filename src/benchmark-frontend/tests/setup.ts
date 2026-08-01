import '@testing-library/jest-dom/vitest';
import { vi, beforeEach, afterEach } from 'vitest';
import { products } from '../src/data/products';

beforeEach(() => {
  localStorage.clear();
  window.history.pushState({}, '', '/');
  // jsdom doesn't implement window.scrollTo — ProductListPage's scroll-restore
  // effect calling it is correct real-browser behavior, but without this stub
  // jsdom logs a console.error on every mount, failing any test that asserts
  // console cleanliness.
  window.scrollTo = vi.fn();
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
