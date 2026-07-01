import { Link } from 'react-router-dom';
import { useComparisonContext } from '../context/ComparisonContext';
import { useProductContext } from '../context/ProductContext';
import { formatPrice, formatRating } from '../utils/formatters';
import type { Product } from '../types/product';

export default function ComparePage() {
  const { comparedIds, removeFromComparison, clearComparison } = useComparisonContext();
  const { products } = useProductContext();

  const comparedProducts: Product[] = comparedIds
    .map((id) => products.find((p) => String(p.id) === id))
    .filter((p): p is Product => p !== undefined);

  return (
    <main className="container">
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h1>Compare Products</h1>
        {comparedProducts.length > 0 && (
          <button type="button" onClick={clearComparison}>
            Clear All
          </button>
        )}
      </header>

      {comparedProducts.length === 0 ? (
        <p role="status">
          No products selected for comparison. <Link to="/">Browse the catalog</Link> to add some.
        </p>
      ) : (
        <div
          className="compare-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${comparedProducts.length}, 1fr)`,
            gap: '1rem',
            alignItems: 'start',
          }}
        >
          {comparedProducts.map((product) => (
            <article key={product.id} className="card compare-card">
              <div className="card-body">
                <div className="card-header">
                  <h2 className="card-title">{product.name}</h2>
                  <button
                    type="button"
                    aria-label={`Remove ${product.name} from comparison`}
                    onClick={() => removeFromComparison(String(product.id))}
                    className="comparison-remove-btn"
                  >
                    ✕
                  </button>
                </div>

                <p className="card-category">{product.category}</p>

                <div className="card-price">
                  {product.discountPct != null && (
                    <span className="price-original">${product.price}</span>
                  )}
                  <span className="price-current">
                    {formatPrice(product.price, product.discountPct)}
                  </span>
                  {product.discountPct != null && (
                    <span className="badge badge-discount">-{product.discountPct}%</span>
                  )}
                </div>

                <p className="card-rating">{formatRating(product.rating, product.reviewCount)}</p>

                <p className={`card-stock ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </p>

                <p className="card-description">{product.description}</p>

                <div className="card-tags" aria-label="Tags">
                  {product.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>

                <Link to={`/product/${product.id}`} className="btn">
                  View Details
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
