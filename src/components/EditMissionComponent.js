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
  const [selectedMissionTitle, setSelectedMissionTitle] = useState(null);
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
  }, [mission.id]);

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
        <Typography variant="body2" color="secondary.dark">
          La mission que vous avez choisie :
        </Typography>
        <ListItem alignItems="flex-start">
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
          <Typography variant="body2" color="secondary.dark" mb={2}>
            Vous souhaitez choisir une autre mission que celle ci-dessus ?
            Veuillez cliquer dans ce cas sur une autre mission de la liste
            ci-dessous.
          </Typography>
          {!missions ? (
            ''
          ) : (
            <Select
              sx={{
                marginBottom: '1rem',
                fontSize: `${
                  selectedMissionTitle == '-- Choisir une mission --'
                } && '12px'`,
                color: `${selectedMissionTitle === null} && 'menu.main'`,
              }}
              size="small"
              fullWidth
              displayEmpty
              value={
                selectedMissionTitle === undefined ||
                selectedMissionTitle === null ||
                missions.length === 0
                  ? ''
                  : selectedMissionTitle
              }
              onChange={handleMissionChange}>
              <MenuItem
                value={''}
                sx={{ color: 'menu.main', fontSize: '14px' }}>
                -- Choisir une mission --
              </MenuItem>
              {missions.map((mission) => (
                <MenuItem key={mission.id} value={mission.id}>
                  {mission.title}
                </MenuItem>
              ))}
            </Select>
          )}
        </Box>
      </List>
      <Button variant="contained" disabled={!showButton} onClick={handleSubmit}>
        Enregistrer
      </Button>
    </>
  );
}

export default YourComponent;
