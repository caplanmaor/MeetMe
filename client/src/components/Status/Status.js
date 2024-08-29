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
import { fetchInitialStatuses, updateStatusInDB } from "./Requests";
import { getStatusColor } from "./Helpers";
import "./Status.css";

const Status = ({ username, userID, onLogout }) => {
  const [statusSelection, setStatusSelection] = useState("");
  const [statuses, setStatuses] = useState([]);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [userPrevStatus, setUserPrevStatus] = useState("Not Specified");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const data = await fetchInitialStatuses(token);
        setStatuses(data);

        const prevStatus = data.find((s) => s.user_id === userID);
        if (prevStatus) {
          setUserPrevStatus(prevStatus.status);
        }
      } catch (error) {
        console.error(error.message);
        if (error.message === "Unauthorized access") {
          onLogout();
        }
      }
    };

    fetchData();

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
    // eslint-disable-next-line
  }, []);

  const handleStatusChange = async (status) => {
    try {
      const token = localStorage.getItem("token");
      await updateStatusInDB(userID, status, token);
      setUserPrevStatus(status);
    } catch (error) {
      console.error(error.message);
      if (error.message === "Unauthorized access") {
        onLogout();
      }
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
            handleStatusChange(e.target.value);
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
      <Button variant="contained" color="warning" onClick={onLogout}>
        Logout
      </Button>
    </div>
  );
};

export default Status;
