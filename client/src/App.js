import React from "react";
import Status from "./components/Status";
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
  return (
    <div className="App">
      <Status />
    </div>
  );
}

export default App;
