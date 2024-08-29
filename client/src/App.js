import React, { useState, useEffect } from "react";
import Status from "./components/Status";
import Login from "./components/Login";
import { jwtDecode } from "jwt-decode";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userID, setUserID] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);

        // check token expiration
        if (decodedToken.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          setIsAuthenticated(false);
        } else {
          setUserID(decodedToken.user_id);
          setUsername(decodedToken.sub);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
        setIsAuthenticated(false);
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setUsername(userData.user_name);
    setUserID(userData.user_id);
    setIsAuthenticated(true);
  };

  return (
    <div className="App">
      {isAuthenticated ? (
        <Status
          username={username}
          userID={userID}
          setIsAuthenticated={setIsAuthenticated}
        />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
