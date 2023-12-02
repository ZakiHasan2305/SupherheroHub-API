import React, { useState, useEffect } from "react";
import "./App.css";
import LoginSignup from "./Components/LoginSignup/LoginSignup";

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
      <LoginSignup/>
    </div>
  );
}

export default App