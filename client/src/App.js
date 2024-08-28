import React, { useState, useEffect } from "react";
import Status from "./components/Status";
import Login from "./components/Login";
import { jwtDecode } from "jwt-decode";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userID, setUserID] = useState("");
  const [username, setUsername] = useState("");

  // if the user is already logged in, set the user details from the token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserID(decodedToken.user_id);
      setUsername(decodedToken.sub);
      setIsAuthenticated(true);
    }
  }, []);

  // if the user needs to log in, set the user name from the login form
  const handleLogin = (username) => {
    setUsername(username);
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
