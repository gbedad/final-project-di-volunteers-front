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
import BorderedBoxWithLabel from './borderedBox';

// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// import { AuthContext } from '../AuthContext';

import { existingLocations, existingModalities } from '../options/existingOptions';

const fabStyle = {
  position: 'absolute',
  bottom: 10,
  right: 16,
};

const LocationsPossibleComponent = ({ userSelected }) => {
  const location = useLocation();
  const [locationsPossible, setLocationsPossible] = useState([]);
  const [selectedModality, setSelectedModality] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  // const token = useContext(AuthContext);
  //  const subjectClassesRanges = userLogged.user.skill.topics

  // const userId = location.state.userLogged.user.id;
  const userId =
    location.state.userLogged.user.id === userSelected
      ? location.state.userLogged.user.id
      : userSelected;
  // console.log('USERID', userId);

  useEffect(() => {
    const getLocations = async () => {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/user-by-id/${userId}`
      );
      // console.log(response.data.skill.where_location);
      const skills = response.data.skill;
      //   const parsed_array = response.data.skill.locations.map(string => JSON.parse(string));
      if (skills && skills.where_location) {
        setSelectedModality(skills.how_location);
        setLocationsPossible(skills.where_location);
        setIsLoading(false);
      }
      if (response.data.skill === null) setIsLoading(false);
    };

    getLocations();
  }, [userId]);

  const handleModalityChange = (value) => {
  setSelectedModality(value);
};


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
        `${process.env.REACT_APP_BASE_URL}/create-skill/${userId}`,
        { how_location: selectedModality, where_location: locationsPossible },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // console.log(response.data);

      if (response.data.message) {
        // toast.success(response.data.message, {
        //   position: 'top-center',
        // });
        // console.log('Locations saved successfully');
      } else {
        console.error('Failed to save locations');
        // toast.error('Failed to save location', {
        //   position: 'top-center',
        // });
      }
    } catch (error) {
      console.error('Failed to save locations', error);

      // Check if the error is from the server response
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        // toast.error(error.response.data.message, {
        //   position: 'top-center',
        // });
      } else {
        // Handle other types of errors (e.g., network issues)
        // toast.error('Failed to save location', {
        //   position: 'top-center',
        // });
      }
    } finally {
      // console.log('Saving locations: ', locationsPossible);
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
      <BorderedBoxWithLabel label="Modalités et lieux" sx={{ display: 'flex' }}>
  <Grid container spacing={1} style={{marginTop:'16px'}}>
    <Grid item xs={12}>
      <TextField
        size="small"
        fullWidth
        variant="outlined"
        label="Modalités"
        select
        value={selectedModality}
        onChange={(e) => handleModalityChange(e.target.value)}
      >
        {existingModalities.map((modality, idx) => (
          <MenuItem key={idx} value={modality}>
            {modality}
          </MenuItem>
        ))}
      </TextField>
    </Grid>

    {selectedModality !== 'A distance' && (
      <>
        <Grid item xs={12}>
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
        </Grid>

        {isLoading ? (
          <Grid item xs={12}>
            <Box sx={{ width: '100%' }}>
              <LinearProgress />
            </Box>
          </Grid>
        ) : (
          locationsPossible &&
          locationsPossible.map((loc, index) => (
            <Grid item xs={12} key={index}>
              <Grid container spacing={1} style={{ marginTop: '16px' }}>
                <Grid item xs={9}>
                  <TextField
                    size="small"
                    fullWidth
                    variant="outlined"
                    label="Site"
                    select
                    value={loc}
                    onChange={(e) => handleLocationChange(e.target.value, index)}
                  >
                    {existingLocations.map((location, idx) => (
                      <MenuItem key={idx} value={location}>
                        {location}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={2}>
                  <Button onClick={() => handleRemoveLocation(index)}>
                    <DeleteIcon sx={{ fontSize: 40 }} color="trash" />
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          ))
        )}            
      </>
    )}
     <Grid item xs={12}>
            <Button
              sx={{ marginTop: '10px' }}
              variant="contained"
              color="primary"
              onClick={handleSaveLocationsPossible}
              // disabled={disableSave || !showButton}
            >
              Enregistrer
            </Button>
          </Grid>
  </Grid>
</BorderedBoxWithLabel>

    </div>
  );
};

export default LocationsPossibleComponent;
