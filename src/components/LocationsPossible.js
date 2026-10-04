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

import {
  existingLocations,
  existingModalities,
} from '../options/existingOptions';
import { useAutoSave } from '../js/useAutoSave';
import SaveStatus from './application/SaveStatus';

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
      if (skills) {
        setSelectedModality(skills.how_location || '');
        setLocationsPossible(skills.where_location || []);
      }
      setIsLoading(false);
    };

    getLocations();
  }, [userId]);

  const [modalityState, saveModality] = useAutoSave(userId, 'how_location');
  const [placesState, savePlaces] = useAutoSave(userId, 'where_location');
  // One indicator for the whole block
  const states = [modalityState, placesState];
  const saveState = states.includes('error')
    ? 'error'
    : states.includes('saving') || states.includes('pending')
      ? 'saving'
      : states.includes('saved')
        ? 'saved'
        : 'idle';

  // Places are saved as soon as one is chosen; empty rows are ignored
  const persistPlaces = (places) => savePlaces(places.filter(Boolean));

  const handleModalityChange = (value) => {
    setSelectedModality(value);
    saveModality(value);
  };

  const handleAddLocation = () => {
    setLocationsPossible([...locationsPossible, '']);
  };

  const handleLocationChange = (value, index) => {
    const updatedLocationsPossible = [...locationsPossible];
    updatedLocationsPossible[index] = value;
    setLocationsPossible(updatedLocationsPossible);
    persistPlaces(updatedLocationsPossible);
  };

  const handleRemoveLocation = (index) => {
    const updatedLocationsPossible = [...locationsPossible];
    updatedLocationsPossible.splice(index, 1);
    setLocationsPossible(updatedLocationsPossible);
    persistPlaces(updatedLocationsPossible);
  };

  const fab = {
    color: 'primary',
    sx: fabStyle,
    icon: <AddIcon />,
    label: 'Add',
  };

  return (
    <div>
      <BorderedBoxWithLabel label="Modalités et lieux *" sx={{ display: 'flex' }}>
        <Grid container spacing={1} style={{ marginTop: '16px' }}>
          <Grid item xs={12}>
            <TextField
              size="small"
              fullWidth
              variant="outlined"
              label="Modalités"
              select
              value={selectedModality}
              onChange={(e) => handleModalityChange(e.target.value)}>
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
                    disabled={locationsPossible.some((place) => !place)}>
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
                          onChange={(e) =>
                            handleLocationChange(e.target.value, index)
                          }>
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
          <Grid item xs={12} sx={{ minHeight: 28 }}>
            <SaveStatus state={saveState} />
          </Grid>
        </Grid>
      </BorderedBoxWithLabel>
    </div>
  );
};

export default LocationsPossibleComponent;
