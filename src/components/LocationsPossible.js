import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Typography,
  Button,
  Grid,
  MenuItem,
  TextField,
  Box,
  LinearProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import BorderedBoxWithLabel from './borderedBox';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthContext } from '../AuthContext';

import { existingLocations } from '../options/existingOptions';

const fabStyle = {
  position: 'absolute',
  bottom: 16,
  right: 16,
};

const LocationsPossibleComponent = () => {
  const location = useLocation();
  const [locationsPossible, setLocationsPossible] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userLogged } = location.state;
  const token = useContext(AuthContext);
  //  const subjectClassesRanges = userLogged.user.skill.topics

  const userId = location.state.userLogged.user.id;

  useEffect(() => {
    const getLocations = async () => {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/user-by-id/${userId}`
      );
      // console.log(response.data.skill.where_location);
      const skills = response.data.skill;
      //   const parsed_array = response.data.skill.locations.map(string => JSON.parse(string));
      if (skills && skills.where_location) {
        setLocationsPossible(skills.where_location);
        setIsLoading(false);
      }
      if (response.data.skill === null) setIsLoading(false);
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
        toast.success('Location saved successfully', {
          position: 'top-center',
        });
        console.log('Locations saved successfully');
      } else {
        console.error('Failed to save locations');
        toast.error('Failed to save location', {
          position: 'top-center',
        });
      }
    } catch (error) {
      toast.error('Failed to save location', {
        position: 'top-center',
      });
      console.error('Failed to save locations', error);
    }
    console.log('Saving locations: ', locationsPossible);
  };

  const fab = {
    color: 'primary',
    sx: fabStyle,
    icon: <AddIcon />,
    label: 'Add',
  };

  return (
    <div>
      <BorderedBoxWithLabel label="Lieux" sx={{ display: 'flex' }}>
        {/* <Button
          variant="contained"
          color="primary"
          onClick={handleAddLocation}
          sx={{ mr: 2 }}>
          Add Location
        </Button> */}
        <label>
          <Fab
            sx={fab.sx}
            aria-label={fab.label}
            color={fab.color}
            onClick={() => handleAddLocation()}
            component="button">
            {fab.icon}
          </Fab>
        </label>
        {isLoading ? (
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
          </Box>
        ) : (
          locationsPossible &&
          locationsPossible.map((loc, index) => (
            <Grid
              mb={2}
              container
              spacing={1}
              key={index}
              style={{ marginTop: '16px' }}>
              <Grid item xs={10}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Location"
                  select
                  value={loc}
                  onChange={(e) => handleLocationChange(e.target.value, index)}>
                  {existingLocations.map((location, idx) => (
                    <MenuItem key={idx} value={location}>
                      {location}
                    </MenuItem>
                  ))}
                  {/* <MenuItem value="Maison des Associations">
                    Maison des Associations
                  </MenuItem>
                  <MenuItem value="Gabriel Lamé">Gabriel Lamé</MenuItem>
                  <MenuItem value="Kiosque Paris 12">Kiosque Paris 12</MenuItem>
                  <MenuItem value="Aubervilliers">Aubervilliers</MenuItem>
                  <MenuItem value="Bercy">Bercy</MenuItem> */}
                  {/* Add more subjects as needed */}
                </TextField>
              </Grid>

              <Grid item xs={2}>
                <Button onClick={() => handleRemoveLocation(index)}>
                  <DeleteIcon sx={{ fontSize: 40 }} color="secondary" />
                </Button>
              </Grid>
            </Grid>
          ))
        )}

        <Button
          sx={{ marginTop: '10px' }}
          variant="outlined"
          color="primary"
          onClick={handleSaveLocationsPossible}>
          CONFIRMER
        </Button>
      </BorderedBoxWithLabel>
    </div>
  );
};

export default LocationsPossibleComponent;
