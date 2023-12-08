import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './Navigation.css'

const Navigation = () => {
  const location = useLocation();

  const removeToken = () => {
    localStorage.removeItem('jwtToken');
  };

  const isAdmin = () => {
    const decodedToken = jwtDecode(localStorage.getItem('jwtToken'));
    return decodedToken && decodedToken.account && decodedToken.account.isAdmin;
  };

  return (
    <nav className="navbar">
      <ul>
        <li><Link to="/home" className={location.pathname === '/home' ? 'active' : ''}>Home</Link></li>
        <li><Link to="/heroes" className={location.pathname === '/heroes' ? 'active' : ''}>Heroes</Link></li>
        <li><Link to="/lists" className={location.pathname === '/lists' ? 'active' : ''}>Lists</Link></li>
        {isAdmin() && <li><Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>Admin</Link></li>}
        <li><Link to="/updatePassword" className={location.pathname === '/updatePassword' ? 'active' : ''}>Update Password</Link></li>
        <li><Link to="/home" onClick={removeToken}>Logout</Link></li>
      </ul>
    </nav>
  );
}

export default Navigation;
