import type { Product } from '../types/product';
import { formatPrice, formatRating, truncate } from '../utils/formatters';
import FavouriteButton from './FavouriteButton';
import { useComparisonContext } from '../context/ComparisonContext';
import { useFilterContext } from '../context/FilterContext';

type Props = {
  product: Product;
  onSelect?: (id: string) => void;
};

export default function ProductCard({ product, onSelect }: Props) {
  const { isCompared, addToComparison, removeFromComparison } = useComparisonContext();
  const { setCategory } = useFilterContext();
  const productId = String(product.id);
  const hasDiscount = product.discountPct != null;
  const compared = isCompared(productId);

  return (
    <article
      className="card"
      data-testid={`product-${product.id}`}
      onClick={() => onSelect?.(productId)}
      style={{ cursor: onSelect ? 'pointer' : undefined }}
    >
      <div className="card-image">
        <img
          src={`/images/${product.name.toLowerCase().replace(/\s+/g, '-')}.jpg`}
          alt={product.name}
          loading="lazy"
        />
      </div>

      <div className="card-body">
        <div className="card-header">
          <h3 className="card-title">{product.name}</h3>
          {hasDiscount && (
            <span className="badge badge-discount">-{product.discountPct}%</span>
          )}
          <FavouriteButton productId={productId} />
        </div>

        <button
          type="button"
          className="card-category"
          onClick={(e) => {
            e.stopPropagation();
            setCategory(product.category);
          }}
        >
          Filter by {product.category}
        </button>

        <p className="card-description">{truncate(product.description)}</p>

        <div className="card-price">
          {hasDiscount && (
            <span className="price-original">${product.price}</span>
          )}
          <span className="price-current">{formatPrice(product.price, product.discountPct)}</span>
        </div>

        <p className="card-rating">{formatRating(product.rating, product.reviewCount)}</p>

        <div className="card-tags" aria-label="Tags">
          {product.tags.map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>

        <p className={`card-stock ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
          {product.inStock ? 'In Stock' : 'Out of Stock'}
        </p>

        <button
          type="button"
          aria-pressed={compared}
          aria-label={compared ? `Remove ${product.name} from comparison` : `Add ${product.name} to comparison`}
          className={`compare-btn${compared ? ' is-compared' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            compared ? removeFromComparison(productId) : addToComparison(productId);
          }}
        >
          {compared ? 'Remove from compare' : 'Compare'}
        </button>
      </div>
    </article>
  );
}
