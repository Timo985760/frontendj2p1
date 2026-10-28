import { NavLink } from 'react-router-dom';
import './Navigation.css';

function Navigation() {
  return (
    <header className="header-container">
      <div className="top-banner">
        <div className="brand-section">
          <div className="brand-logo">
            <span className="pokeball-icon"></span>
          </div>
          <div className="brand-details">
            <span className="brand-title">POKECORP ENTERPRISE</span>
            <span className="brand-subtitle">Personnel & Talent Management</span>
          </div>
        </div>


        <div className="user-profile">
          <div className="user-avatar">HR</div>
          <div className="user-info">
            <span className="user-name">Ash Ketchum</span>
            <span className="user-role">Head of Operations</span>
          </div>
        </div>
      </div>

      <nav className="main-nav">
        <ul className="nav-links">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
              end
            >
              DASHBOARD
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/pokedex"
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            >
              POKÉDEX
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/favorites"
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            >
              FAVORITES
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/teams"
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            >
              TEAMS
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Navigation;
