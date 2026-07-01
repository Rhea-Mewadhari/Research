import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

const MAX_COMPARED = 3;

interface ComparisonContextValue {
  comparedIds: string[];
  addToComparison: (id: string) => void;
  removeFromComparison: (id: string) => void;
  clearComparison: () => void;
  isCompared: (id: string) => boolean;
}

const ComparisonContext = createContext<ComparisonContextValue | null>(null);

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [comparedIds, setComparedIds] = useState<string[]>([]);

  const addToComparison = useCallback((id: string) => {
    setComparedIds((prev) => {
      if (prev.includes(id)) return prev;
      // FIFO: drop oldest when at capacity
      return prev.length >= MAX_COMPARED ? [...prev.slice(1), id] : [...prev, id];
    });
  }, []);

  const removeFromComparison = useCallback((id: string) => {
    setComparedIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const clearComparison = useCallback(() => setComparedIds([]), []);

  const isCompared = useCallback(
    (id: string) => comparedIds.includes(id),
    [comparedIds],
  );

  return (
    <ComparisonContext.Provider
      value={{ comparedIds, addToComparison, removeFromComparison, clearComparison, isCompared }}
    >
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparisonContext(): ComparisonContextValue {
  const ctx = useContext(ComparisonContext);
  if (!ctx) throw new Error('useComparisonContext must be used within ComparisonProvider');
  return ctx;
}
