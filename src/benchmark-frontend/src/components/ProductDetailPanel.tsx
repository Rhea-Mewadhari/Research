import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import Spinner from './Spinner';
import type { Product } from '../types/product';

type Props = {
  productId: string | null;
  onClose: () => void;
};

const BASE_URL = 'http://localhost:3001';

export default function ProductDetailPanel({ productId, onClose }: Props) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const prevFocusRef = useRef<Element | null>(null);

  const isOpen = productId !== null;

  // Fetch product details when panel opens
  useEffect(() => {
    if (!productId) return;
    setIsLoading(true);
    setProduct(null);
    setError(null);

    fetch(`${BASE_URL}/api/products/${productId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load product (${res.status})`);
        return res.json() as Promise<Product>;
      })
      .then((data) => {
        setProduct(data);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load product');
        setIsLoading(false);
      });
  }, [productId]);

  // Scroll lock
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Focus-on-open: capture previous focus element and move focus to close button
  useLayoutEffect(() => {
    if (!isOpen) return;
    prevFocusRef.current = document.activeElement;
    closeButtonRef.current?.focus();
    return () => {
      if (prevFocusRef.current instanceof HTMLElement) {
        prevFocusRef.current.focus();
      }
    };
  }, [isOpen]);

  // Escape-to-close: document-level listener so it fires regardless of focus position
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus trap: cycle Tab/Shift+Tab within panel focusable elements
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return;
    const focusableSelector =
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const panel = panelRef.current;
    if (!panel) return;
    const focusable = Array.from(panel.querySelectorAll<HTMLElement>(focusableSelector));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <>
      <div
        aria-hidden="true"
        className="detail-backdrop"
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200 }}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-panel-title"
        className="detail-panel"
        onKeyDown={handleKeyDown}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100%',
          width: '420px',
          maxWidth: '100%',
          background: '#fff',
          overflowY: 'auto',
          zIndex: 201,
          padding: '1.5rem',
        }}
      >
        <button
          ref={closeButtonRef}
          type="button"
          aria-label="Close panel"
          className="detail-close-btn"
          onClick={onClose}
        >
          ✕
        </button>

        {isLoading && <Spinner />}
        {error && <p role="alert">{error}</p>}
        {product && (
          <article>
            <h2 id="detail-panel-title">{product.name}</h2>
            <p className="card-category">{product.category}</p>
            <p className="card-description">{product.description}</p>
            <div className="card-price">
              {product.discountPct != null && (
                <span className="price-original">${product.price}</span>
              )}
              <span className="price-current">
                $
                {product.discountPct != null
                  ? Math.round(product.price * (1 - product.discountPct / 100))
                  : product.price}
              </span>
            </div>
            <p className="card-rating">
              {product.rating.toFixed(1)} ({product.reviewCount.toLocaleString()} reviews)
            </p>
            <p className={`card-stock ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </p>
            <div className="card-tags" aria-label="Tags">
              {product.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </article>
        )}
      </div>
    </>,
    document.body,
  );
}
