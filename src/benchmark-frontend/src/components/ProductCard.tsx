import type { Product } from '../types/product';

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  return (
    <article className="card" data-testid={`product-${product.id}`}>
      <h3>{product.name}</h3>
      <p>Category: {product.category}</p>
      <p>Price: ${product.price}</p>
      <p>Rating: {product.rating}</p>
      <p>{product.inStock ? 'In Stock' : 'Out of Stock'}</p>
    </article>
  );
}