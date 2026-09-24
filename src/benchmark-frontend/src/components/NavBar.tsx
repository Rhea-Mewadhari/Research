import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useFavouritesContext } from '../context/FavouritesContext';
import { useComparisonContext } from '../context/ComparisonContext';
import { useAuthContext } from '../context/AuthContext';

export default function NavBar() {
  const { favouriteIds } = useFavouritesContext();
  const { comparedIds } = useComparisonContext();
  const { user, isAuthenticated, logout } = useAuthContext();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

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
          <span className="nav-username">{user?.username}</span>
          <button className="nav-link" onClick={handleLogout}>
            Log Out
          </button>
        </>
      ) : (
        <>
          <Link to="/signup" className="nav-link">
            Sign Up
          </Link>
          <Link to="/login" className="nav-link">
            Log In
          </Link>
        </>
      )}
    </nav>
  );
}
