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

import { AuthContext } from '../AuthContext';

const fabStyle = {
  position: 'absolute',
  bottom: 16,
  right: 16,
};

const DayTimeRangeComponent = () => {
  const location = useLocation();
  const [dayTimeRanges, setDayTimeRanges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userLogged } = location.state;
  const { token } = useContext(AuthContext);

  //  const dayTimesRanges = userLogged.user.skill.when_day_slot

  const userId = location.state.userLogged.user.id;

  //  const parsed_array = dayTimesRanges.map(string => JSON.parse(string));
  useEffect(() => {
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
      }
      if (
        Object.keys(response.data.skill).lenght === 0 ||
        !response.data.skill.when_day_slot
      ) {
        setIsLoading(false);
      }
    };

    getDays();
  }, []);
  //  useEffect(() => {
  //   setDayTimeRanges(parsed_array)
  //  }, [])

  const handleAddDayTimeRange = () => {
    setDayTimeRanges([
      ...dayTimeRanges,
      { day: '', startTime: '', endTime: '' },
    ]);
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
  };

  const handleSaveDayTimeRanges = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/create-skill/${userLogged.user.id}`,
        { when_day_slot: JSON.stringify(dayTimeRanges) },
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
  };
  const fab = {
    color: 'primary',
    sx: fabStyle,
    icon: <AddIcon />,
    label: 'Add',
  };

  return (
    <div>
      <BorderedBoxWithLabel label="Jours et heures" sx={{ display: 'flex' }}>
        {/* <Typography variant="h5">Day and Time Range</Typography> */}
        {/* <Button
          variant="contained"
          color="primary"
          onClick={handleAddDayTimeRange}
          sx={{ mr: 2 }}>
          Add Day and Time Range
        </Button> */}
        <label>
          <Fab
            sx={fab.sx}
            aria-label={fab.label}
            color={fab.color}
            onClick={() => handleAddDayTimeRange()}
            component="button">
            {fab.icon}
          </Fab>
        </label>
        {isLoading ? (
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
          </Box>
        ) : (
          dayTimeRanges &&
          dayTimeRanges.map((dayTimeRange, index) => (
            <Grid
              mb={2}
              container
              spacing={1}
              key={index}
              style={{ marginTop: '16px' }}>
              <Grid item xs={4}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Day</InputLabel>
                  <Select
                    label="Day"
                    value={dayTimeRange.day}
                    onChange={(e) => handleDayChange(e.target.value, index)}>
                    <MenuItem value="">Choisir un jour</MenuItem>
                    <MenuItem value="Monday">Lundi</MenuItem>
                    <MenuItem value="Tuesday">Mardi</MenuItem>
                    <MenuItem value="Wednesday">Mercredi</MenuItem>
                    <MenuItem value="Thursday">Jeudi</MenuItem>
                    <MenuItem value="Friday">Vendredi</MenuItem>
                    <MenuItem value="Saturday">Samedi</MenuItem>
                    <MenuItem value="Sunday">Dimanche</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Start Time"
                  type="time"
                  value={dayTimeRange.startTime}
                  onChange={(e) => handleStartTimeChange(e.target.value, index)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    step: 300,
                  }}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="End Time"
                  type="time"
                  value={dayTimeRange.endTime}
                  onChange={(e) => handleEndTimeChange(e.target.value, index)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    step: 300,
                  }}
                />
              </Grid>
              <Grid item xs={2}>
                <Button onClick={() => handleRemoveDayTimeRange(index)}>
                  <DeleteIcon sx={{ fontSize: 40 }} color="secondary" />
                </Button>
              </Grid>
            </Grid>
          ))
        )}
        {dayTimeRanges && (
          <Button
            sx={{ marginTop: '10px' }}
            variant="outlined"
            color="primary"
            onClick={handleSaveDayTimeRanges}>
            CONFIRMER
          </Button>
        )}
      </BorderedBoxWithLabel>
    </div>
  );
};

export default DayTimeRangeComponent;
