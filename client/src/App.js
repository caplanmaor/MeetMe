import React from "react";
import Status from "./components/Status/Status";
import Login from "./components/Login/Login";
import { useAuth } from "./hooks/useAuth";
import "./App.css";

function App() {
  const { isAuthenticated, username, userID, handleLogin, handleLogout } =
    useAuth();

  return (
    <div className="App">
      <h1>MeetMe 📖</h1>
      {isAuthenticated ? (
        <Status username={username} userID={userID} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
