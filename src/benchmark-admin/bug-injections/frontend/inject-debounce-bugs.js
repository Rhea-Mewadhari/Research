import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../benchmark-frontend');

function write(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated: ${filePath}`);
}

// FilterContext.tsx — two bugs introduced:
//   BUG 1: useDebounce is called with delayMs=0 instead of 300, so debouncedSearch
//           updates on every keystroke with no real delay. The hook is imported and
//           wired correctly in every other respect; only the delay constant is wrong.
//   BUG 2: No immediate-clear behaviour. When search is set to '', debouncedSearch
//           goes through the same (broken) 0 ms path rather than clearing instantly.
//           The correct solution must add an explicit bypass for the empty-string case.
write(
  path.join(repoRoot, 'src', 'context', 'FilterContext.tsx'),
  `import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { SavedFilter, SortOption } from '../types/product';
import { useDebounce } from '../hooks/useDebounce';

interface FilterContextValue {
  search: string;
  debouncedSearch: string;
  category: string;
  inStockOnly: boolean;
  sortBy: SortOption;
  savedFilters: SavedFilter[];
  setSearch: (s: string) => void;
  setCategory: (c: string) => void;
  setInStockOnly: (b: boolean) => void;
  setSortBy: (s: SortOption) => void;
  saveCurrentFilters: (name: string) => void;
  restoreFilter: (id: string) => void;
  deleteFilter: (id: string) => void;
  clearFilters: () => void;
}

const STORAGE_KEY = 'benchmark_saved_filters';

function loadSavedFilters(): SavedFilter[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedFilter[]) : [];
  } catch {
    return [];
  }
}

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [search, setSearchState] = useState('');
  const [category, setCategoryState] = useState('All');
  const [inStockOnly, setInStockOnlyState] = useState(false);
  const [sortBy, setSortByState] = useState<SortOption>('default');
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(loadSavedFilters);

  // BUG: delay is 0 — useDebounce is wired but provides no real debounce.
  // Should be 300. Additionally there is no bypass for the empty-string (clear) case.
  const debouncedSearch = useDebounce(search, 0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedFilters));
  }, [savedFilters]);

  const setSearch = useCallback((s: string) => setSearchState(s), []);
  const setCategory = useCallback((c: string) => setCategoryState(c), []);
  const setInStockOnly = useCallback((b: boolean) => setInStockOnlyState(b), []);
  const setSortBy = useCallback((s: SortOption) => setSortByState(s), []);

  const saveCurrentFilters = useCallback(
    (name: string) => {
      const snapshot = { search, category, inStockOnly, sortBy };
      setSavedFilters((prev) => {
        const idx = prev.findIndex((f) => f.name === name);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], snapshot };
          return next;
        }
        return [...prev, { id: crypto.randomUUID(), name, createdAt: Date.now(), snapshot }];
      });
    },
    [search, category, inStockOnly, sortBy],
  );

  const restoreFilter = useCallback(
    (id: string) => {
      const entry = savedFilters.find((f) => f.id === id);
      if (!entry) return;
      setSearchState(entry.snapshot.search);
      setCategoryState(entry.snapshot.category);
      setInStockOnlyState(entry.snapshot.inStockOnly);
      setSortByState(entry.snapshot.sortBy);
    },
    [savedFilters],
  );

  const deleteFilter = useCallback((id: string) => {
    setSavedFilters((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const clearFilters = useCallback(() => {
    setSearchState('');
    setCategoryState('All');
    setInStockOnlyState(false);
    setSortByState('default');
  }, []);

  return (
    <FilterContext.Provider
      value={{
        search,
        debouncedSearch,
        category,
        inStockOnly,
        sortBy,
        savedFilters,
        setSearch,
        setCategory,
        setInStockOnly,
        setSortBy,
        saveCurrentFilters,
        restoreFilter,
        deleteFilter,
        clearFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilterContext(): FilterContextValue {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilterContext must be used within FilterProvider');
  return ctx;
}
`,
);

console.log('Debounce bugs injected successfully.');
