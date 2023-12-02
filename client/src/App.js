import React, { useState, useEffect } from "react";
import "./App.css";

const port = 8000;

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`http://localhost:${port}/api/hero/4`)
      .then((res) => res.json())
      .then((data) => setMessage(data.name));
  }, []);

  return (
    <div className="App">
      <h1>{message}</h1>
    </div>
  );
}

export default App