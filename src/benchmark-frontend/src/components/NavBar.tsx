import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useFavouritesContext } from '../context/FavouritesContext';
import { useComparisonContext } from '../context/ComparisonContext';
import { AuthContext } from '../context/AuthContext';

export default function NavBar() {
  const { favouriteIds } = useFavouritesContext();
  const { comparedIds } = useComparisonContext();
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const user = auth?.user ?? null;
  const isAuthenticated = auth?.isAuthenticated ?? false;

  function handleLogout() {
    auth?.logout();
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

      {isAuthenticated && user ? (
        <>
          <span className="nav-username">{user.username}</span>
          <button onClick={handleLogout} className="nav-link">
            Log Out
          </button>
        </>
      ) : (
        <>
          <NavLink
            to="/signup"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Sign Up
          </NavLink>
          <NavLink
            to="/login"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Log In
          </NavLink>
        </>
      )}
    </nav>
  );
}
