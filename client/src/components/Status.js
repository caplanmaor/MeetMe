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
} from "@mui/material";
import "./Status.css";

const Status = () => {
  const [statusSelection, setStatusSelection] = useState("");
  const [statuses, setStatuses] = useState([]);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchInitialStatuses = async () => {
      const response = await fetch("http://localhost:8000/initial_statuses/");
      const data = await response.json();
      setStatuses(data);
    };

    fetchInitialStatuses();

    const websocket = new WebSocket("ws://localhost:8000/ws");

    websocket.onopen = () => {
      console.log("WebSocket connection established");
    };

    websocket.onmessage = (event) => {
      const newStatus = JSON.parse(event.data);
      setStatuses((prevStatuses) =>
        prevStatuses
          .filter((s) => s.user_id !== newStatus.user_id)
          .concat(newStatus)
      );
    };

    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    websocket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      websocket.close();
    };
  }, []);

  const updateStatusInDB = async (status) => {
    // TODO: get the current user_id
    const user_id = 1;

    await fetch(
      `http://localhost:8000/update_status/?user_id=${user_id}&status=${status}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
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
        Hello USER NAME, your current status is {statusSelection}
      </Typography>
      {/* TODO: display the initial status not the current status, use the statuses */}
      {/* TODO: replace USER NAME with auth user */}
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
          .filter((s) => s.user_id.toString().includes(search))
          .map((status, index) => (
            <ListItem
              key={index}
              style={{ backgroundColor: getStatusColor(status.status) }}
            >
              <Typography>{`User ${status.user_id}: ${status.status}`}</Typography>
            </ListItem>
          ))}
      </List>
    </div>
  );
};

export default Status;
