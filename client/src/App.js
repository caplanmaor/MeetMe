import React, { useState, useEffect } from "react";
import Status from "./components/Status";
import Login from "./components/Login";
import { jwtDecode } from "jwt-decode";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userID, setUserID] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserID(decodedToken.user_id);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (userID) => {
    setIsAuthenticated(true);
    setUserID(userID);
  };

  return (
    <div className="App">
      {isAuthenticated ? (
        <Status userID={userID} setIsAuthenticated={setIsAuthenticated} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
