import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useComparisonContext } from '../context/ComparisonContext';
import { useFavouritesContext } from '../context/FavouritesContext';

export default function NavBar() {
  const { favouriteIds } = useFavouritesContext();
  const { comparedIds } = useComparisonContext();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

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

      {isAuthenticated ? (
        <>
          <span>{user?.username}</span>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Log Out
          </button>
        </>
      ) : (
        <>
          <Link to="/signup">Sign Up</Link>
          <Link to="/login">Log In</Link>
        </>
      )}
    </nav>
  );
}
