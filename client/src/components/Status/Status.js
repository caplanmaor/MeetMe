import React, { useState, useEffect } from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Button,
} from "@mui/material";
import {
  fetchInitialStatuses,
  updateStatusInDB,
  setupWebSocket,
} from "./Requests";
import StatusList from "./StatusList";
import "./Status.css";

const Status = ({ username, userID, onLogout }) => {
  const [statusSelection, setStatusSelection] = useState("");
  const [statuses, setStatuses] = useState([]);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [userPrevStatus, setUserPrevStatus] = useState("Not Specified");

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchData = async () => {
      try {
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

    const websocket = setupWebSocket(token, (newStatus) => {
      setStatuses((prevStatuses) => {
        const filteredStatuses = prevStatuses.filter(
          (s) => s.user_id !== newStatus.user_id
        );
        const updatedStatuses = [...filteredStatuses, newStatus];
        updatedStatuses.sort((a, b) => a.username.localeCompare(b.username));
        return updatedStatuses;
      });
    });

    return () => websocket.close();
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

      <StatusList
        statuses={statuses}
        filter={filter}
        setFilter={setFilter}
        search={search}
        setSearch={setSearch}
      />

      <Button variant="contained" color="warning" onClick={onLogout}>
        Logout
      </Button>
    </div>
  );
};

export default Status;
