import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../benchmark-frontend');

function write(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated: ${filePath}`);
}

// FavouritesContext.tsx — two bugs introduced:
//   BUG 1: The catch block does not revert the optimistic update. When fetch
//           rejects, only the error message is set; favouriteIds stays in the
//           toggled position. The wasAdded flag is present in the closure but
//           unused in the error path.
//   BUG 2: setPendingIds is never called to mark a product as in-flight, so
//           isPending(productId) always returns false and FavouriteButton is
//           never disabled during the request.
write(
  path.join(repoRoot, 'src', 'context', 'FavouritesContext.tsx'),
  `import {
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

      // BUG: pendingIds is never updated — isPending always returns false,
      // so FavouriteButton is never disabled during the request.

      try {
        // 2. Persist to server
        if (wasAdded) {
          await fetch(\`\${BASE_URL}/api/favourites\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId }),
          });
        } else {
          await fetch(\`\${BASE_URL}/api/favourites/\${productId}\`, { method: 'DELETE' });
        }
        setError(null);
      } catch (err) {
        // BUG: optimistic update is NOT reverted on failure — the UI stays in
        // the toggled state even though the server rejected the change.
        setError(err instanceof Error ? err.message : 'Failed to update favourite');
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
`,
);

console.log('Optimistic UI bugs injected successfully.');
