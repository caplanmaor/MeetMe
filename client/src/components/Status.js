import React, { useState, useEffect } from "react";
import {
  TextField,
  List,
  ListItem,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
} from "@mui/material";
import "./Status.css";

const Status = ({ username, userID, setIsAuthenticated }) => {
  const [statusSelection, setStatusSelection] = useState("");
  const [statuses, setStatuses] = useState([]);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [userPrevStatus, setUserPrevStatus] = useState("Not Specified");

  useEffect(() => {
    const fetchInitialStatuses = async () => {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/initial_statuses/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        data.sort((a, b) => a.username.localeCompare(b.username));
        setStatuses(data);

        const prevStatus = data.find((s) => s.user_id === userID);
        if (prevStatus) {
          setUserPrevStatus(prevStatus.status);
        }
      } else if (response.status === 401) {
        console.error("Unauthorized access");
        localStorage.removeItem("token");
        setIsAuthenticated(false);
      } else {
        console.error("Failed to fetch statuses:", response.status);
      }
    };

    fetchInitialStatuses();

    const websocket = new WebSocket(
      `ws://localhost:8000/ws?token=${localStorage.getItem("token")}`
    );

    websocket.onmessage = (event) => {
      const newStatus = JSON.parse(event.data);

      setStatuses((prevStatuses) => {
        const filteredStatuses = prevStatuses.filter(
          (s) => s.user_id !== newStatus.user_id
        );
        const updatedStatuses = [...filteredStatuses, newStatus];
        updatedStatuses.sort((a, b) => a.username.localeCompare(b.username));
        return updatedStatuses;
      });
    };
  }, [userID, setIsAuthenticated]);

  const updateStatusInDB = async (status) => {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:8000/update_status/?user_id=${userID}&status=${status}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 401) {
      console.error("Unauthorized access");
      localStorage.removeItem("token");
      setIsAuthenticated(false);
    }
    setUserPrevStatus(status);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Working":
        return "#03c03c";
      case "Working Remotely":
        return "#77dd77";
      case "On Vacation":
        return "#cfcfc4";
      case "Business Trip":
        return "#aec6cf";
      default:
        return "#000000";
    }
  };

  return (
    <div className="status-container">
      <Typography variant="h6">
        Hello {username}, your current status is: {userPrevStatus}
      </Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel id="status-label">Update Work Status</InputLabel>
        <Select
          labelId="status-label"
          value={statusSelection}
          onChange={(e) => {
            setStatusSelection(e.target.value);
            updateStatusInDB(e.target.value);
          }}
          variant="filled"
        >
          <MenuItem value="Working">Working</MenuItem>
          <MenuItem value="Working Remotely">Working Remotely</MenuItem>
          <MenuItem value="On Vacation">On Vacation</MenuItem>
          <MenuItem value="Business Trip">Business Trip</MenuItem>
        </Select>
      </FormControl>

      <div className="filter-section">
        <TextField
          label="Search by name"
          variant="filled"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
        />
        <FormControl fullWidth>
          <InputLabel id="filter-label">Filter By Status</InputLabel>
          <Select
            labelId="filter-label"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            variant="filled"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Working">Working</MenuItem>
            <MenuItem value="Working Remotely">Working Remotely</MenuItem>
            <MenuItem value="On Vacation">On Vacation</MenuItem>
            <MenuItem value="Business Trip">Business Trip</MenuItem>
          </Select>
        </FormControl>
      </div>

      <List>
        {statuses
          .filter((s) => s.status.includes(filter))
          .filter((s) =>
            s.username.toLowerCase().includes(search.toLowerCase())
          )
          .map((status, index) => (
            <ListItem key={index}>
              <div
                style={{
                  backgroundColor: getStatusColor(status.status),
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  marginRight: "10px",
                }}
              ></div>
              <Typography>{`${status.username}: ${status.status}`}</Typography>
            </ListItem>
          ))}
      </List>
      <Button
        variant="contained"
        color="warning"
        onClick={() => {
          localStorage.removeItem("token");
          setIsAuthenticated(false);
        }}
      >
        Logout
      </Button>
    </div>
  );
};

export default Status;
