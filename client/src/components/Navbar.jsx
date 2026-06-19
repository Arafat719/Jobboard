import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `jb-navbar__link${isActive ? ' jb-navbar__link--active' : ''}`;

  return (
    <nav className="jb-navbar" aria-label="Main navigation">
      <div className="jb-navbar__inner">
        <NavLink to="/" className="jb-navbar__logo" onClick={closeMenu}>
          JobBoard
        </NavLink>

        {/* Desktop center links */}
        <div className="jb-navbar__links">
          <NavLink to="/jobs" className={navLinkClass}>Jobs</NavLink>
          {isAuthenticated && (
            <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
          )}
          {isAuthenticated && user?.role === 'admin' && (
            <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>
          )}
          {isAuthenticated && user?.role === 'employer' && (
            <NavLink to="/dashboard" className="jb-navbar__link jb-navbar__link--cta">
              + Post a Job
            </NavLink>
          )}
        </div>

        {/* Desktop right actions */}
        <div className="jb-navbar__actions">
          <button
            className="jb-navbar__theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {isAuthenticated ? (
            <button className="jb-btn jb-btn-outline jb-navbar__auth-btn" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <>
              <NavLink to="/login" className="jb-btn jb-btn-outline jb-navbar__auth-btn">
                Login
              </NavLink>
              <NavLink to="/register" className="jb-btn jb-btn-primary jb-navbar__auth-btn">
                Register
              </NavLink>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          className="jb-navbar__hamburger"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-expanded={menuOpen}
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="jb-navbar__mobile-menu">
          <NavLink to="/jobs" className="jb-navbar__mobile-link" onClick={closeMenu}>
            Jobs
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/dashboard" className="jb-navbar__mobile-link" onClick={closeMenu}>
              Dashboard
            </NavLink>
          )}
          {isAuthenticated && user?.role === 'admin' && (
            <NavLink to="/admin" className="jb-navbar__mobile-link" onClick={closeMenu}>
              Admin
            </NavLink>
          )}

          <div className="jb-navbar__mobile-divider" />

          {isAuthenticated ? (
            <button className="jb-navbar__mobile-link jb-navbar__mobile-link--danger" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <>
              <NavLink to="/login" className="jb-navbar__mobile-link" onClick={closeMenu}>
                Login
              </NavLink>
              <NavLink to="/register" className="jb-navbar__mobile-link jb-navbar__mobile-link--accent" onClick={closeMenu}>
                Register
              </NavLink>
            </>
          )}

          <button
            className="jb-navbar__mobile-link jb-navbar__mobile-theme"
            onClick={() => { toggleTheme(); closeMenu(); }}
          >
            {theme === 'dark' ? '☀️  Light mode' : '🌙  Dark mode'}
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
