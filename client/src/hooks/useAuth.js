import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userID, setUserID] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    username,
    userID,
    handleLogin,
    handleLogout,
  };
};
