import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import {
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

// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// import { AuthContext } from '../AuthContext';

import { existingLocations } from 'options/existingOptions';

const fabStyle = {
  position: 'absolute',
  bottom: -10,
  right: 5,
};

const LocationsPossibleComponent = ({ studentId }) => {
  const location = useLocation();
  const [locationsPossible, setLocationsPossible] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [disableSave, setDisableSave] = useState(true);
  //   const { userLogged } = location.state;
  // const token = useContext(AuthContext);

  useEffect(() => {
    const getLocations = async () => {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/students/${studentId}`
      );
      console.log(JSON.parse(response.data.where_location));
      const locations = JSON.parse(response.data.where_location);
      //   const parsed_array = response.data.skill.locations.map(string => JSON.parse(string));
      if (response.data && response.data.where_location) {
        setLocationsPossible(locations);
        setIsLoading(false);
        setShowButton(false);
      }
      if (response.data.where_location === null) setIsLoading(false);
    };

    getLocations();
  }, [studentId]);
  

  const handleAddLocation = () => {
    setLocationsPossible([...locationsPossible, '']);
    setShowButton(true);
  };
  useEffect(() => {
    // Check if any location field is empty
    const hasEmptyLocation = locationsPossible.some((loc) => loc === '');
    // Disable the "Enregistrer" button if any location field is empty
    setDisableSave(hasEmptyLocation);
  }, [locationsPossible]);
  const handleLocationChange = (value, index) => {
    const updatedLocationsPossible = [...locationsPossible];
    updatedLocationsPossible[index] = value;
    setLocationsPossible(updatedLocationsPossible);
  };

  const handleRemoveLocation = (index) => {
    const updatedLocationsPossible = [...locationsPossible];
    updatedLocationsPossible.splice(index, 1);
    setLocationsPossible(updatedLocationsPossible);
    setShowButton(true);
  };

  const handleSaveLocationsPossible = async () => {
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_BASE_URL}/students-locations/${studentId}`,
        { where_location: locationsPossible },
        {
          headers: {
            'Content-Type': 'application/json',
            // 'x-access-token': userLogged.token,
          },
        }
      );

      // console.log(response.data);

      if (response.data) {
        // toast.success(response.data.message, {
        //   position: 'top-center',
        // });
        // console.log('Locations saved successfully');
        // console.log(response.data.updatedStudent);
        setShowButton(false);
      } else {
        console.error('Failed to save locations');
        // toast.error('Failed to save location', {
        //   position: 'top-center',
        // });
      }
    } catch (error) {
      console.error('Failed to save locations', error);

      // Check if the error is from the server response
    }
  };

  const fab = {
    color: 'primary',
    sx: fabStyle,
    icon: <AddIcon />,
    label: 'Add',
  };

  return (
    <div>
      <label>
        <Fab
          sx={fab.sx}
          aria-label={fab.label}
          color={fab.color}
          onClick={() => handleAddLocation()}
          component="button"
          // disabled={showButton}
        >
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
                size="small"
                fullWidth
                variant="outlined"
                label="Site"
                select
                value={loc}
                onChange={(e) => handleLocationChange(e.target.value, index)}
                // error={!loc} // Add error prop
                // helperText={!loc ? 'Ce champ est obligatoire' : ''}
              >
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
                <DeleteIcon sx={{ fontSize: 40 }} color="trash" />
              </Button>
            </Grid>
          </Grid>
        ))
      )}
      {locationsPossible && (
        <Button
          sx={{ marginTop: '10px' }}
          variant="contained"
          color="primary"
          onClick={handleSaveLocationsPossible}
          // disabled={disableSave || !showButton}
        >
          Enregistrer
        </Button>
      )}
    </div>
  );
};

export default LocationsPossibleComponent;
