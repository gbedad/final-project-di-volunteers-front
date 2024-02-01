import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Select,
  MenuItem,
  Typography,
} from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import MapIcon from '@mui/icons-material/Map';

// ... other imports
const BASE_URL = process.env.REACT_APP_BASE_URL;

function YourComponent({ user }) {
  const [selectedMissionTitle, setSelectedMissionTitle] = useState(
    user.mission.title || ''
  );
  const [missions, setMissions] = useState([]);
  const [mission, setMission] = useState(user.mission);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const getUserMission = async () => {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/user-by-id/${user.id}`
      );
      // console.log(response.data.mission);
      const newMission = response.data.mission;
      setMission(newMission);
    };

    getUserMission();
  }, [user.id, showButton]);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/missions`)
      .then((response) =>
        setMissions(
          response.data.filter((mission) => mission.is_active === true)
        )
      )
      .catch((error) => console.error(error));
  }, [user.id]);

  // console.log(missions);

  const handleMissionChange = async (e) => {
    setSelectedMissionTitle(e.target.value);
    setShowButton(true);
    // Update user's mission title in your state or send a request to the server
  };
  // console.log(selectedMissionTitle);

  const handleSubmit = async () => {
    await axios.patch(`${BASE_URL}/update-user-profile/${user.id}`, {
      mission_id: selectedMissionTitle,
    });
    setShowButton(false);
    // console.log(response.data.message);
  };

  return (
    <>
      <List>
        <ListItem>
          <ListItemAvatar>
            <Avatar>
              <CategoryIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={mission.title}
            secondary={mission.description}
          />
        </ListItem>
        <ListItem>
          <ListItemAvatar>
            <Avatar>
              <MapIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={mission.location} secondary="" />
        </ListItem>
        <Box mt={2}>
          <Typography variant="body1">Modifier la mission</Typography>
          {mission.title !== undefined && (
            <Select
              fullWidth
              value={selectedMissionTitle || mission.title || ''}
              onChange={handleMissionChange}>
              {missions &&
                missions.map((mission) => (
                  <MenuItem key={mission.id} value={mission.id}>
                    {mission.title}
                  </MenuItem>
                ))}
            </Select>
          )}
        </Box>
      </List>
      <Button variant="contained" disabled={!showButton} onClick={handleSubmit}>
        Confirmer
      </Button>
    </>
  );
}

export default YourComponent;
