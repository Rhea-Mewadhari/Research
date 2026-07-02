import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../benchmark-frontend');

function write(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated: ${filePath}`);
}

// ProductDetailPanel.tsx — focus management stripped out entirely.
//
// The rendering, data fetching, scroll lock, close button, and backdrop are
// all intact. Only the four accessibility behaviours are missing:
//
//   BUG 1: No focus-on-open — focus stays on the triggering element/body.
//   BUG 2: No focus trap — Tab escapes the panel into the page behind it.
//   BUG 3: No Escape handler — the panel cannot be closed via keyboard.
//   BUG 4: No focus restore — closing the panel leaves focus on document.body.
//
// panelRef is kept and attached to the panel div as a structural hint.
// closeButtonRef and previousFocusRef are removed; agents must add them back.
// The getFocusable helper is removed; agents must implement or inline it.
write(
  path.join(repoRoot, 'src', 'components', 'ProductDetailPanel.tsx'),
  `import { useEffect, useRef, useState } from 'react';
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

  const isOpen = productId !== null;

  // Fetch product details when panel opens
  useEffect(() => {
    if (!productId) return;
    setIsLoading(true);
    setProduct(null);
    setError(null);

    fetch(\`\${BASE_URL}/api/products/\${productId}\`)
      .then((res) => {
        if (!res.ok) throw new Error(\`Failed to load product (\${res.status})\`);
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

  // BUG: focus management is not implemented.
  //   Missing behaviours:
  //     1. Move focus to the close button when the panel opens.
  //     2. Trap Tab / Shift+Tab within the panel while it is open.
  //     3. Close the panel on Escape (listener must be on document, not a
  //        React onKeyDown handler, because the panel is portal-rendered).
  //     4. Return focus to the triggering element when the panel closes.

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
                <span className="price-original">\${product.price}</span>
              )}
              <span className="price-current">
                \$
                {product.discountPct != null
                  ? Math.round(product.price * (1 - product.discountPct / 100))
                  : product.price}
              </span>
            </div>
            <p className="card-rating">
              {product.rating.toFixed(1)} ({product.reviewCount.toLocaleString()} reviews)
            </p>
            <p className={\`card-stock \${product.inStock ? 'in-stock' : 'out-of-stock'}\`}>
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
`,
);

console.log('Focus management bugs injected successfully.');
