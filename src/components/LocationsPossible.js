import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Typography,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  LinearProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

import { UserContext } from '../UserContext';

const LocationsPossibleComponent = () => {
  const location = useLocation();
  const [locationsPossible, setLocationsPossible] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userLogged } = location.state;
  const { token } = useContext(UserContext);
  //  const subjectClassesRanges = userLogged.user.skill.topics

  const userId = location.state.userLogged.user.id;

  useEffect(() => {
    const getLocations = async () => {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/user-by-id/${userId}`
      );
      console.log(response.data);
      //   const parsed_array = response.data.skill.locations.map(string => JSON.parse(string));
      if (response.data.skill) {
        setLocationsPossible(response.data.skill.where_location);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    };

    getLocations();
  }, []);

  const handleAddLocation = () => {
    setLocationsPossible([...locationsPossible, '']);
  };

  const handleLocationChange = (value, index) => {
    const updatedLocationsPossible = [...locationsPossible];
    updatedLocationsPossible[index] = value;
    setLocationsPossible(updatedLocationsPossible);
  };

  const handleRemoveLocation = (index) => {
    const updatedLocationsPossible = [...locationsPossible];
    updatedLocationsPossible.splice(index, 1);
    setLocationsPossible(updatedLocationsPossible);
  };

  const handleSaveLocationsPossible = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/create-skill/${userLogged.user.id}`,
        { where_location: locationsPossible },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': userLogged.token,
          },
        }
      );
      console.log(response.data.message);
      if (response.data.message) {
        console.log('Day and time ranges saved successfully');
      } else {
        console.error('Failed to save day and time ranges');
      }
    } catch (error) {
      console.error('Failed to save day and time ranges', error);
    }
    console.log('Saving subject and class ranges: ', locationsPossible);
  };

  return (
    <div>
      <Typography variant="h5">Locations</Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddLocation}
        sx={{ mr: 2 }}>
        Add Location
      </Button>
      {isLoading ? (
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
        </Box>
      ) : (
        locationsPossible.map((locationPossible, index) => (
          <Grid container spacing={2} key={index} style={{ marginTop: '16px' }}>
            <Grid item xs={8}>
              <TextField
                fullWidth
                variant="outlined"
                label="Location"
                select
                value={locationPossible}
                onChange={(e) => handleLocationChange(e.target.value, index)}>
                <MenuItem value="Maison des Associations">
                  Maison des Associations
                </MenuItem>
                <MenuItem value="Gabriel Lamé">Gabriel Lamé</MenuItem>
                <MenuItem value="Kiosque Paris 12">Kiosque Paris 12</MenuItem>
                <MenuItem value="Aubervilliers">Aubervilliers</MenuItem>
                <MenuItem value="Bercy">Bercy</MenuItem>
                {/* Add more subjects as needed */}
              </TextField>
            </Grid>

            <Grid item xs={3}>
              <Button onClick={() => handleRemoveLocation(index)}>
                <DeleteIcon sx={{ fontSize: 40 }} color="secondary" />
              </Button>
            </Grid>
          </Grid>
        ))
      )}
      <Button
        variant="contained"
        color="primary"
        onClick={handleSaveLocationsPossible}>
        Save
      </Button>
    </div>
  );
};

export default LocationsPossibleComponent;
