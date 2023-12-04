import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Navigation from './Components/Navigation/Navigation'; // Import the Navigation component
import LoginSignup from './Components/LoginSignup/LoginSignup'
import Heroes from './Components/Heroes/Heroes'
import Authenticate from './Components/Authenticate/Authenticate'
import Lists from './Components/Lists/Lists'
import Admin from './Components/Admin/Admin'
import Reviews from './Components/Reviews/Reviews'

import "./App.css";

const port = 8000;

function App() {
  const [message, setMessage] = useState("");

  // useEffect(() => {
  //   fetch(`http://localhost:${port}/api/hero/4`)
  //     .then((res) => res.json())
  //     .then((data) => setMessage(data.name));
  // }, []);



  return (
    <div className="App">
      <BrowserRouter>
      <Navigation />
      <Routes>
        <Route index element={<LoginSignup />} />
        <Route path="/home" element={<LoginSignup />} />
        <Route path="/lists" element={<Lists />} />
        <Route path="/authenticate/:token" element={<Authenticate />} />
        <Route path="/heroes" element={<Heroes />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/reviews" element={<Reviews />} />
      </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App