import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
} from 'react';

interface FavouritesContextValue {
  favouriteIds: Set<string>;
  pendingIds: Set<string>;
  error: string | null;
  toggleFavourite: (productId: string) => Promise<void>;
  isFavourite: (productId: string) => boolean;
  isPending: (productId: string) => boolean;
}

const STORAGE_KEY = 'benchmark_favourites';
const BASE_URL = 'http://localhost:3001';

const FavouritesContext = createContext<FavouritesContextValue | null>(null);

export function FavouritesProvider({ children }: { children: ReactNode }) {
  const [favouriteIds, setFavouriteIds] = useState<Set<string>>(new Set());
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const ids: string[] = JSON.parse(raw);
        setFavouriteIds(new Set(ids));
      }
    } catch {
      // ignore corrupt storage
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...favouriteIds]));
  }, [favouriteIds]);

  const toggleFavourite = useCallback(
    async (productId: string) => {
      const wasAdded = !favouriteIds.has(productId);

      // 1. Optimistic update — immediate UI change
      setFavouriteIds((prev) => {
        const next = new Set(prev);
        if (wasAdded) {
          next.add(productId);
        } else {
          next.delete(productId);
        }
        return next;
      });

      setPendingIds((prev) => {
        const next = new Set(prev);
        next.add(productId);
        return next;
      });

      try {
        // 2. Persist to server
        if (wasAdded) {
          await fetch(`${BASE_URL}/api/favourites`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId }),
          });
        } else {
          await fetch(`${BASE_URL}/api/favourites/${productId}`, { method: 'DELETE' });
        }
        setError(null);
      } catch (err) {
        // Revert the optimistic update for this product only
        setFavouriteIds((prev) => {
          const next = new Set(prev);
          if (wasAdded) {
            next.delete(productId);
          } else {
            next.add(productId);
          }
          return next;
        });
        setError(err instanceof Error ? err.message : 'Failed to update favourite');
      } finally {
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      }
    },
    [favouriteIds],
  );

  const isFavourite = useCallback(
    (productId: string) => favouriteIds.has(productId),
    [favouriteIds],
  );

  const isPending = useCallback(
    (productId: string) => pendingIds.has(productId),
    [pendingIds],
  );

  return (
    <FavouritesContext.Provider
      value={{ favouriteIds, pendingIds, error, toggleFavourite, isFavourite, isPending }}
    >
      {children}
    </FavouritesContext.Provider>
  );
}

export function useFavouritesContext(): FavouritesContextValue {
  const ctx = useContext(FavouritesContext);
  if (!ctx) throw new Error('useFavouritesContext must be used within FavouritesProvider');
  return ctx;
}
