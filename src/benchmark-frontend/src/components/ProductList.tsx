import type { Product } from '../types/product';
import ProductCard from './ProductCard';

type Props = {
  products: Product[];
  onSelect?: (id: string) => void;
};

export default function ProductList({ products, onSelect }: Props) {
  if (products.length === 0) {
    return <p role="status">No products found.</p>;
  }

  return (
    <section aria-label="Product results">
      <div className="grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}
