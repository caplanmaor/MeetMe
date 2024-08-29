import React from "react";
import {
  TextField,
  List,
  ListItem,
  Typography,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
} from "@mui/material";
import { getStatusColor } from "./Colors";

const StatusList = ({ statuses, filter, setFilter, search, setSearch }) => {
  return (
    <div>
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
    </div>
  );
};

export default StatusList;
