// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

// Iconos
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Storage';
import BuildIcon from '@mui/icons-material/Build';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <>
      <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
        <MenuIcon />
      </div>

      <nav className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="panda-logo">
            🐼 <span>Panda Assets</span>
          </div>
          <div className="close-mobile-menu" onClick={closeMobileMenu}>
            <CloseIcon />
          </div>
        </div>

        <ul className="sidebar-menu">
          <li className={isActive('/')}>
            <Link to="/" onClick={closeMobileMenu}>
              <DashboardIcon /> <span>Dashboard</span>
            </Link>
          </li>
          <li className={isActive('/inventory') || isActive('/inventory/new') || location.pathname.includes('/inventory/edit/') ? 'active' : ''}>
            <Link to="/inventory" onClick={closeMobileMenu}>
              <InventoryIcon /> <span>Inventario</span>
            </Link>
          </li>
          <li className={location.pathname.includes('/maintenance/') ? 'active' : ''}>
            <Link to="/inventory" onClick={closeMobileMenu}>
              <BuildIcon /> <span>Mantenimiento</span>
            </Link>
          </li>
          <li className={isActive('/project-assignment')}>
            <Link to="/project-assignment" onClick={closeMobileMenu}>
              <AssignmentIcon /> <span>Asignación a Proyectos</span>
            </Link>
          </li>
        </ul>

        <div className="sidebar-footer">
          <p>Panda Assets v1.0</p>
          <p>© 2025 UTK Assets</p>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenu}></div>
      )}
    </>
  );
};

export default Navbar;