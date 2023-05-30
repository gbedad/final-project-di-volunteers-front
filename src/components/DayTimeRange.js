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

import { UserContext } from '../UserContext';

const DayTimeRangeComponent = () => {
  const location = useLocation();
  const [dayTimeRanges, setDayTimeRanges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userLogged } = location.state;
  const { token } = useContext(UserContext);
  //  const dayTimesRanges = userLogged.user.skill.when_day_slot

  const userId = location.state.userLogged.user.id;

  //  const parsed_array = dayTimesRanges.map(string => JSON.parse(string));
  useEffect(() => {
    const getDays = async () => {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/user-by-id/${userId}`
      );
      console.log(response.data);
      if (response.data.skill.when_day_slot) {
        const parsed_array = response.data.skill.when_day_slot.map((string) =>
          JSON.parse(string)
        );
        setDayTimeRanges(parsed_array);
        setIsLoading(false);
      } else {
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

  return (
    <div>
      <BorderedBoxWithLabel label="Jours et heures" sx={{ display: 'flex' }}>
        {/* <Typography variant="h5">Day and Time Range</Typography> */}
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddDayTimeRange}
          sx={{ mr: 2 }}>
          Add Day and Time Range
        </Button>
        {isLoading ? (
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
          </Box>
        ) : (
          dayTimeRanges &&
          dayTimeRanges.map((dayTimeRange, index) => (
            <Grid
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
                    <MenuItem value="">Select a day</MenuItem>
                    <MenuItem value="Monday">Monday</MenuItem>
                    <MenuItem value="Tuesday">Tuesday</MenuItem>
                    <MenuItem value="Wednesday">Wednesday</MenuItem>
                    <MenuItem value="Thursday">Thursday</MenuItem>
                    <MenuItem value="Friday">Friday</MenuItem>
                    <MenuItem value="Saturday">Saturday</MenuItem>
                    <MenuItem value="Sunday">Sunday</MenuItem>
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
        {dayTimeRanges.length > 0 ? (
          <Button
            sx={{ marginTop: '10px' }}
            variant="contained"
            color="primary"
            onClick={handleSaveDayTimeRanges}>
            Save
          </Button>
        ) : (
          ''
        )}
      </BorderedBoxWithLabel>
    </div>
  );
};

export default DayTimeRangeComponent;
