import { Link } from 'react-router-dom';
import ProductList from '../components/ProductList';
import { useFavouritesContext } from '../context/FavouritesContext';
import { useProductContext } from '../context/ProductContext';

export default function FavouritesPage() {
  const { favouriteIds } = useFavouritesContext();
  const { products } = useProductContext();

  const favouriteProducts = products.filter((p) => favouriteIds.has(String(p.id)));

  return (
    <main className="container">
      <header>
        <h1>Favourites</h1>
        <p>Your saved products.</p>
      </header>

      {favouriteIds.size === 0 ? (
        <p role="status">
          No favourites yet. <Link to="/">Browse the catalog</Link> to add some.
        </p>
      ) : (
        <>
          <p data-testid="results-count">{favouriteProducts.length} favourite(s)</p>
          <ProductList products={favouriteProducts} />
        </>
      )}
    </main>
  );
}
