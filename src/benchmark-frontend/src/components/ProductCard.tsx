import type { Product } from '../types/product';
import { formatPrice, formatRating, truncate } from '../utils/formatters';

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const hasDiscount = product.discountPct != null;

  return (
    <article className="card" data-testid={`product-${product.id}`}>
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
        </div>

        <p className="card-category">{product.category}</p>

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
      </div>
    </article>
  );
}
