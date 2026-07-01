import { NavLink } from 'react-router-dom';

export default function NavBar() {
  return (
    <nav className="navbar" aria-label="Main navigation">
      <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
        Catalog
      </NavLink>
      <NavLink
        to="/favourites"
        className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
      >
        Favourites
      </NavLink>
      <NavLink
        to="/compare"
        className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
      >
        Compare
      </NavLink>
    </nav>
  );
}
