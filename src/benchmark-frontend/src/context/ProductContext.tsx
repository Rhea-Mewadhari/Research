import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { fetchProducts } from '../api/productsApi';
import type { Product } from '../types/product';

interface ProductContextValue {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  totalCount: number;
  setPage: (n: number) => void;
  refresh: () => void;
}

const ProductContext = createContext<ProductContextValue | null>(null);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const doFetch = useCallback(async (p: number) => {
    setIsLoading(true);
    try {
      const res = await fetchProducts(p);
      setProducts(res.data);
      setTotalPages(res.totalPages);
      setTotalCount(res.total);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
      // stale-while-error: retain previous products in state
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    doFetch(page);
  }, [page, doFetch]);

  const refresh = useCallback(() => doFetch(page), [page, doFetch]);

  return (
    <ProductContext.Provider
      value={{ products, isLoading, error, page, totalPages, totalCount, setPage, refresh }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProductContext(): ProductContextValue {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error('useProductContext must be used within ProductProvider');
  return ctx;
}
