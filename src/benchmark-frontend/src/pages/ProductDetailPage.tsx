import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FavouriteButton from '../components/FavouriteButton';
import Spinner from '../components/Spinner';
import { useComparisonContext } from '../context/ComparisonContext';
import { formatPrice, formatRating } from '../utils/formatters';
import type { Product } from '../types/product';

const BASE_URL = 'http://localhost:3001';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isCompared, addToComparison, removeFromComparison } = useComparisonContext();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setError(null);

    fetch(`${BASE_URL}/api/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Product not found (${res.status})`);
        return res.json() as Promise<Product>;
      })
      .then((data) => {
        setProduct(data);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load product');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  const compared = id ? isCompared(id) : false;

  return (
    <main className="container">
      <button type="button" onClick={() => navigate(-1)} className="back-btn">
        &larr; Back
      </button>

      {isLoading && <Spinner />}

      {error && <p role="alert">{error}</p>}

      {product && (
        <article className="product-detail">
          <header className="product-detail-header">
            <h1>{product.name}</h1>
            <div className="product-detail-actions">
              <FavouriteButton productId={String(product.id)} />
              <button
                type="button"
                aria-pressed={compared}
                aria-label={
                  compared
                    ? `Remove ${product.name} from comparison`
                    : `Add ${product.name} to comparison`
                }
                className={`compare-btn${compared ? ' is-compared' : ''}`}
                onClick={() =>
                  compared
                    ? removeFromComparison(String(product.id))
                    : addToComparison(String(product.id))
                }
              >
                {compared ? 'Remove from compare' : 'Compare'}
              </button>
            </div>
          </header>

          <p className="product-detail-category">{product.category}</p>

          <p className="product-detail-description">{product.description}</p>

          <div className="product-detail-price">
            {product.discountPct != null && (
              <span className="price-original">${product.price}</span>
            )}
            <span className="price-current">{formatPrice(product.price, product.discountPct)}</span>
            {product.discountPct != null && (
              <span className="badge badge-discount">-{product.discountPct}%</span>
            )}
          </div>

          <p className="product-detail-rating">{formatRating(product.rating, product.reviewCount)}</p>

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
    </main>
  );
}
