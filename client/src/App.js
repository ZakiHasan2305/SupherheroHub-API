import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import Navigation from './Components/Navigation/Navigation';
import Home from './Components/Home/Home'
import LoginSignup from './Components/LoginSignup/LoginSignup'
import Heroes from './Components/Heroes/Heroes'
import Authenticate from './Components/Authenticate/Authenticate'
import Lists from './Components/Lists/Lists'
import Admin from './Components/Admin/Admin'
import Reviews from './Components/Reviews/Reviews'

import "./App.css";
import UpdatePassword from "./Components/UpdatePassword/UpdatePassword";


// Get the token from localStorage
const token = localStorage.getItem('jwtToken');

// Decode the token
try {
  console.log(String(token))
  const decodedToken = jwtDecode(token);
  console.log('Decoded Token:', decodedToken);
} catch (error) {
  console.error('Error decoding token:', error);
}


const App = () => {
  // Wrap the whole component in BrowserRouter
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

const AppContent = () => {
  const location = useLocation();

  // Array of routes where the Navigation bar should be hidden
  const routesWithoutNavigation = ['/register', '/authenticate/'];

  // Check if the current path starts with any of the paths in the array
  const shouldRenderNavigation = !routesWithoutNavigation.some(path => location.pathname.startsWith(path));

  // Check if JWT token is present in localStorage
  const isTokenPresent = localStorage.getItem('jwtToken');

  useEffect(() => {
    // Logics to be performed when the component mounts or the JWT token changes
    // For example, you might want to fetch user data based on the token

    // You can replace this with your own logic
    if (isTokenPresent) {
      // Fetch user data or perform other actions
    }
  }, [isTokenPresent]); // Dependency array ensures this effect runs only when the token changes

  return (
    <div className="App">
      {shouldRenderNavigation && isTokenPresent && <Navigation />}
      <Routes>
        <Route index element={<Home />} />
        <Route path="/register" element={<LoginSignup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/lists" element={<Lists />} />
        <Route path="/authenticate/:token" element={<Authenticate />} />
        <Route path="/updatePassword" element={<UpdatePassword />} />
        <Route path="/heroes" element={<Heroes />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/reviews" element={<Reviews />} />
      </Routes>
    </div>
  );
}

export default App;