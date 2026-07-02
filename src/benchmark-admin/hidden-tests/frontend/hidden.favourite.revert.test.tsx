import { renderHook, act } from '@testing-library/react';
import {
  FavouritesProvider,
  useFavouritesContext,
} from '../../../benchmark-frontend/src/context/FavouritesContext';

// All tests use renderHook with FavouritesProvider in isolation — no products
// endpoint is involved. Each test stubs fetch independently so the setup.ts
// mock does not interfere.

// ---------------------------------------------------------------------------
// Revert on failure
// ---------------------------------------------------------------------------

describe('Hidden: favourite revert — failed API call', () => {
  it('a rejected fetch reverts the optimistic add', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network error')),
    );

    const { result } = renderHook(() => useFavouritesContext(), {
      wrapper: FavouritesProvider,
    });

    expect(result.current.isFavourite('1')).toBe(false);

    await act(async () => {
      await result.current.toggleFavourite('1');
    });

    // Must have reverted — product is NOT a favourite after a failed add
    expect(result.current.isFavourite('1')).toBe(false);
  });

  it('a rejected fetch reverts the optimistic remove', async () => {
    // First: add successfully
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }),
    );

    const { result } = renderHook(() => useFavouritesContext(), {
      wrapper: FavouritesProvider,
    });

    await act(async () => {
      await result.current.toggleFavourite('1');
    });

    expect(result.current.isFavourite('1')).toBe(true);

    // Now: remove fails
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network error')),
    );

    await act(async () => {
      await result.current.toggleFavourite('1');
    });

    // Must have reverted — product is STILL a favourite after a failed remove
    expect(result.current.isFavourite('1')).toBe(true);
  });

  it('a successful fetch does not revert', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }),
    );

    const { result } = renderHook(() => useFavouritesContext(), {
      wrapper: FavouritesProvider,
    });

    await act(async () => {
      await result.current.toggleFavourite('1');
    });

    expect(result.current.isFavourite('1')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Concurrent isolation — THE TRAP
//
// A naive fix that stores `const previousIds = new Set(favouriteIds)` before
// the API call and restores it on failure will pass the single-product tests
// above but fail here: the snapshot captured before product A's call includes
// neither A nor B; restoring it on A's failure wipes out B's successful add.
//
// The correct approach uses a per-product functional updater so only the
// specific product is reverted.
// ---------------------------------------------------------------------------

describe('Hidden: favourite revert — concurrent isolation', () => {
  it('a failure on product 1 does not revert a concurrent success on product 2', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string, opts?: RequestInit) => {
        if (typeof url === 'string' && url.includes('/api/favourites')) {
          const body = opts?.body ? JSON.parse(opts.body as string) : {};
          if (body.productId === '1') {
            // Product 1 POST fails
            return Promise.reject(new Error('Network error'));
          }
        }
        // Product 2 POST succeeds
        return Promise.resolve({ ok: true, json: async () => ({}) });
      }),
    );

    const { result } = renderHook(() => useFavouritesContext(), {
      wrapper: FavouritesProvider,
    });

    // Fire both toggles concurrently — neither is awaited individually
    await act(async () => {
      await Promise.all([
        result.current.toggleFavourite('1'),
        result.current.toggleFavourite('2'),
      ]);
    });

    // Product 1 failed — must NOT be a favourite
    expect(result.current.isFavourite('1')).toBe(false);
    // Product 2 succeeded — must STILL be a favourite
    expect(result.current.isFavourite('2')).toBe(true);
  });

  it('two concurrent failures each revert only their own product', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network error')),
    );

    const { result } = renderHook(() => useFavouritesContext(), {
      wrapper: FavouritesProvider,
    });

    await act(async () => {
      await Promise.all([
        result.current.toggleFavourite('1'),
        result.current.toggleFavourite('2'),
      ]);
    });

    expect(result.current.isFavourite('1')).toBe(false);
    expect(result.current.isFavourite('2')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isPending tracking
// ---------------------------------------------------------------------------

describe('Hidden: isPending tracking', () => {
  it('isPending is true while the request is in flight', async () => {
    // A fetch that never resolves keeps the request in-flight indefinitely
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})));

    const { result } = renderHook(() => useFavouritesContext(), {
      wrapper: FavouritesProvider,
    });

    act(() => {
      void result.current.toggleFavourite('1');
    });

    expect(result.current.isPending('1')).toBe(true);
  });

  it('isPending is false after a successful toggle', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }),
    );

    const { result } = renderHook(() => useFavouritesContext(), {
      wrapper: FavouritesProvider,
    });

    await act(async () => {
      await result.current.toggleFavourite('1');
    });

    expect(result.current.isPending('1')).toBe(false);
  });

  it('isPending is false after a failed toggle (finally cleanup)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network error')),
    );

    const { result } = renderHook(() => useFavouritesContext(), {
      wrapper: FavouritesProvider,
    });

    await act(async () => {
      await result.current.toggleFavourite('1');
    });

    expect(result.current.isPending('1')).toBe(false);
  });

  it('isPending for product 2 is unaffected while product 1 is in flight', async () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})));

    const { result } = renderHook(() => useFavouritesContext(), {
      wrapper: FavouritesProvider,
    });

    act(() => {
      void result.current.toggleFavourite('1');
    });

    expect(result.current.isPending('1')).toBe(true);
    expect(result.current.isPending('2')).toBe(false);
  });
});
