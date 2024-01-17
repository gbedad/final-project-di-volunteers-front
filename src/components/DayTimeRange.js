import React, { useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Box,
  LinearProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import BorderedBoxWithLabel from './borderedBox';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthContext } from '../AuthContext';

const fabStyle = {
  position: 'absolute',
  bottom: 10,
  right: 16,
};

const DayTimeRangeComponent = () => {
  const location = useLocation();
  const [dayTimeRanges, setDayTimeRanges] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const { userLogged } = location.state && location.state.userLogged;
  // Check if location.state is not null before destructuring values

  // const { token } = useContext(AuthContext);

  //  const dayTimesRanges = userLogged.user.skill.when_day_slot

  const userId = location.state.userLogged.user.id;
  const token = location.state.userLogged.token;

  //  const parsed_array = dayTimesRanges.map(string => JSON.parse(string));
  useEffect(() => {
    setIsLoading(false);
    const getDays = async () => {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/user-by-id/${userId}`
      );
      console.log(response.data);

      if (response.data.skill && response.data.skill.when_day_slot) {
        const parsed_array = response.data.skill.when_day_slot.map((string) =>
          JSON.parse(string)
        );
        setDayTimeRanges(parsed_array);
        setIsLoading(false);
        setShowButton(false);
      }
    };

    getDays();
  }, []);

  const handleAddDayTimeRange = () => {
    setDayTimeRanges([
      ...dayTimeRanges,
      { day: '', startTime: '', endTime: '' },
    ]);
    setShowButton(true);
  };

  const handleDayChange = (value, index) => {
    const updatedDayTimeRanges = [...dayTimeRanges];
    updatedDayTimeRanges[index].day = value;
    setDayTimeRanges(updatedDayTimeRanges);
  };

  const handleStartTimeChange = (value, index) => {
    const updatedDayTimeRanges = [...dayTimeRanges];
    updatedDayTimeRanges[index].startTime = value;
    setDayTimeRanges(updatedDayTimeRanges);
  };

  const handleEndTimeChange = (value, index) => {
    const updatedDayTimeRanges = [...dayTimeRanges];
    updatedDayTimeRanges[index].endTime = value;
    setDayTimeRanges(updatedDayTimeRanges);
  };

  const handleRemoveDayTimeRange = (index) => {
    const updatedDayTimeRanges = [...dayTimeRanges];
    updatedDayTimeRanges.splice(index, 1);
    setDayTimeRanges(updatedDayTimeRanges);
    setShowButton(true);
  };

  const handleSaveDayTimeRanges = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/create-skill/${userId}`,
        { when_day_slot: JSON.stringify(dayTimeRanges) },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': token,
          },
        }
      );
      console.log(response.data.message);
      if (response.data.message) {
        console.log('Day and time ranges saved successfully');
        toast.success(response.data.message, {
          position: 'top-center',
        });
        setShowButton(false);
      } else {
        toast.error('Failed to save Day and time ranges', {
          position: 'top-center',
        });
        console.error('Failed to save day and time ranges');
      }
    } catch (error) {
      toast.error('Failed to save Day and time ranges', {
        position: 'top-center',
      });
      console.error('Failed to save day and time ranges', error);
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
      <ToastContainer />
      <BorderedBoxWithLabel label="Jours et heures" sx={{ display: 'flex' }}>
        <label>
          <Fab
            sx={fab.sx}
            aria-label={fab.label}
            color={fab.color}
            onClick={() => handleAddDayTimeRange()}
            component="button"
            disabled={showButton}>
            {fab.icon}
          </Fab>
        </label>
        {isLoading ? (
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
          </Box>
        ) : (
          dayTimeRanges &&
          dayTimeRanges.map(
            (dayTimeRange, index) =>
              dayTimeRange && (
                <Grid
                  mb={2}
                  container
                  spacing={1}
                  key={index}
                  style={{ marginTop: '16px' }}>
                  <Grid item xs={4}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Jour</InputLabel>
                      <Select
                        label="Jour"
                        value={dayTimeRange ? dayTimeRange.day : ''}
                        onChange={(e) => handleDayChange(e.target.value, index)}
                        error={!dayTimeRange.day} // Add error prop
                        helperText={
                          !dayTimeRange.day ? 'Ce champ est obligatoire' : ''
                        }>
                        <MenuItem value="">Choisir un jour</MenuItem>
                        <MenuItem value="Lundi">Lundi</MenuItem>
                        <MenuItem value="Mardi">Mardi</MenuItem>
                        <MenuItem value="Mercredi">Mercredi</MenuItem>
                        <MenuItem value="Jeudi">Jeudi</MenuItem>
                        <MenuItem value="Vendredi">Vendredi</MenuItem>
                        <MenuItem value="Samedi">Samedi</MenuItem>
                        <MenuItem value="Dimanche">Dimanche</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      label="Heure début"
                      type="time"
                      value={dayTimeRange.startTime}
                      onChange={(e) =>
                        handleStartTimeChange(e.target.value, index)
                      }
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        step: 300,
                      }}
                      error={!dayTimeRange.startTime} // Add error prop
                      helperText={
                        !dayTimeRange.startTime
                          ? 'Ce champ est obligatoire'
                          : ''
                      }
                    />
                  </Grid>

                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      label="Heure fin"
                      type="time"
                      value={dayTimeRange.endTime}
                      onChange={(e) =>
                        handleEndTimeChange(e.target.value, index)
                      }
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        step: 300,
                      }}
                      error={!dayTimeRange.endTime} // Add error prop
                      helperText={
                        !dayTimeRange.endTime ? 'Ce champ est obligatoire' : ''
                      }
                    />
                  </Grid>

                  <Grid item xs={2}>
                    <Button onClick={() => handleRemoveDayTimeRange(index)}>
                      <DeleteIcon sx={{ fontSize: 40 }} color="secondary" />
                    </Button>
                  </Grid>
                </Grid>
              )
          )
        )}
        {dayTimeRanges && (
          <Button
            sx={{ marginTop: '10px' }}
            variant="contained"
            color="primary"
            onClick={handleSaveDayTimeRanges}
            disabled={!showButton}>
            CONFIRMER
          </Button>
        )}
      </BorderedBoxWithLabel>
    </div>
  );
};

export default DayTimeRangeComponent;
