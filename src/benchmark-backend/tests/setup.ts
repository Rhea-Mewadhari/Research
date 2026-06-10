import { vi, beforeEach, afterEach } from 'vitest';
import { products } from '../src/data/products';

// Stub the global fetch so hidden tests never make real DummyJSON calls.
// dataFetcher.ts calls fetch() directly; stubbing the global intercepts it.
beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        products: products.map((p) => ({
          id: p.id,
          title: p.name,
          price: p.price,
          stock: p.inStock ? 10 : 0,
          category: p.category,
          rating: p.rating,
          description: p.description,
          tags: p.tags,
          discountPercentage: p.discountPct ?? 0,
        })),
      }),
    })
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});
