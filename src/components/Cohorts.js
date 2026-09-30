import React, { useState } from "react";
import { Grid, Button, Typography, List, ListItem, ListItemText, ListItemButton, Paper } from "@mui/material";

const CohortTransferList = () => {
  const academicYears = [
    "2021/2022",
    "2022/2023",
    "2023/2024",
    "2024/2025",
    "2025/2026",
    "2026/2027",
  ]; // Static data on client side

  const [availableYears, setAvailableYears] = useState(academicYears); // Available years
  const [activeYears, setActiveYears] = useState([]); // Active years

  const handleToggle = (year, toActive) => {
    if (toActive) {
      setActiveYears((prev) => [...prev, year]);
      setAvailableYears((prev) => prev.filter((y) => y !== year));
    } else {
      setAvailableYears((prev) => [...prev, year]);
      setActiveYears((prev) => prev.filter((y) => y !== year));
    }
  };

  const handleSave = () => {
    console.log("Active years saved:", activeYears);
    alert("Active years saved successfully!");
    // Optionally send to server if needed
  };

  const renderList = (items, isActive) => (
    <Paper>
      <List>
        {items.map((year) => (
          <ListItem key={year} disablePadding>
            <ListItemButton onClick={() => handleToggle(year, !isActive)}>
              <ListItemText primary={year} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={5}>
        <Typography variant="h6" gutterBottom>
          Années
        </Typography>
        {renderList(availableYears, false)}
      </Grid>
      <Grid item xs={2}>
        <Button
          variant="contained"
          fullWidth
          disabled={activeYears.length === 0}
          onClick={handleSave}
        >
          Enr.
        </Button>
      </Grid>
      <Grid item xs={5}>
        <Typography variant="h6" gutterBottom>
          Cohortes
        </Typography>
        {renderList(activeYears, true)}
      </Grid>
    </Grid>
  );
};

export default CohortTransferList;
