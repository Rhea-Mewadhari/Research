import { NavLink } from 'react-router-dom';
import { useFavouritesContext } from '../context/FavouritesContext';
import { useComparisonContext } from '../context/ComparisonContext';

export default function NavBar() {
  const { favouriteIds } = useFavouritesContext();
  const { comparedIds } = useComparisonContext();

  return (
    <nav className="navbar" aria-label="Main navigation">
      <span className="navbar-brand">ShopCatalog</span>

      <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
        Catalog
      </NavLink>

      <NavLink
        to="/favourites"
        className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
      >
        Favourites
        {favouriteIds.size > 0 && (
          <span
            aria-label={`${favouriteIds.size} saved`}
            style={{
              marginLeft: 6,
              background: '#f43f5e',
              color: '#fff',
              borderRadius: '999px',
              fontSize: '.7rem',
              fontWeight: 700,
              padding: '1px 6px',
              lineHeight: 1.4,
            }}
          >
            {favouriteIds.size}
          </span>
        )}
      </NavLink>

      <NavLink
        to="/compare"
        className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
      >
        Compare
        {comparedIds.length > 0 && (
          <span
            aria-label={`${comparedIds.length} selected`}
            style={{
              marginLeft: 6,
              background: '#818cf8',
              color: '#fff',
              borderRadius: '999px',
              fontSize: '.7rem',
              fontWeight: 700,
              padding: '1px 6px',
              lineHeight: 1.4,
            }}
          >
            {comparedIds.length}
          </span>
        )}
      </NavLink>
    </nav>
  );
}
