import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css'

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <ul>
        <li><Link to="/home" className={location.pathname === '/home' ? 'active' : ''}>Home</Link></li>
        <li><Link to="/heroes" className={location.pathname === '/heroes' ? 'active' : ''}>Heroes</Link></li>
        <li><Link to="/lists" className={location.pathname === '/lists' ? 'active' : ''}>Lists</Link></li>
        <li><Link to="/reviews" className={location.pathname === '/reviews' ? 'active' : ''}>Reviews</Link></li>
        <li><Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>Admin</Link></li>
      </ul>
    </nav>
  );
}

export default Navigation;
