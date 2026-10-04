import React, { useState, useEffect } from 'react';
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
  Box,
  LinearProgress,
  Snackbar,
  SnackbarContent,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import BorderedBoxWithLabel from './borderedBox';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import { useAutoSave } from '../js/useAutoSave';
import SaveStatus from './application/SaveStatus';

// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// import { AuthContext } from '../AuthContext';

const fabStyle = {
  position: 'absolute',
  bottom: 10,
  right: 16,
};

const DayTimeRangeComponent = ({ userSelected }) => {
  const location = useLocation();
  const [dayTimeRanges, setDayTimeRanges] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [allValuesFilled, setAllValuesFilled] = useState(false);
  const [open, setOpen] = useState(false);
  // const { userLogged } = location.state && location.state.userLogged;
  // Check if location.state is not null before destructuring values

  // const { token } = useContext(AuthContext);

  //  const dayTimesRanges = userLogged.user.skill.when_day_slot

  // const userId = location.state.userLogged.user.id;
  const userId =
    location.state.userLogged.user.id === userSelected
      ? location.state.userLogged.user.id
      : userSelected;
  // console.log('USERID', userId);
  const token = location.state.userLogged.token;
  const [saveState, scheduleSave] = useAutoSave(userId, 'when_day_slot');

  // A slot is saved as soon as it is complete
  const isComplete = (range) =>
    !!range.day &&
    !!range.startTime &&
    !!range.endTime &&
    range.startTime < range.endTime;
  const persist = (ranges) =>
    scheduleSave(JSON.stringify(ranges.filter(isComplete)));

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  //  const parsed_array = dayTimesRanges.map(string => JSON.parse(string));
  useEffect(() => {
    setIsLoading(false);
    const getDays = async () => {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/user-by-id/${userId}`
      );
      // console.log(response.data);

      if (response.data.skill && response.data.skill.when_day_slot) {
        const parsed_array = response.data.skill.when_day_slot.map((string) =>
          JSON.parse(string)
        );
        setDayTimeRanges(parsed_array);
        setIsLoading(false);
      }
    };

    getDays();
  }, []);

  useEffect(() => {
    // Check if all values in all objects in dayTimeRanges are filled
    const allFilled = dayTimeRanges.every((dayTimeRange) => {
      return (
        dayTimeRange.day !== '' &&
        dayTimeRange.startTime !== '' &&
        dayTimeRange.endTime !== ''
      );
    });
    // Update allValuesFilled state accordingly
    setAllValuesFilled(allFilled);
  }, [dayTimeRanges]);

  const handleAddDayTimeRange = () => {
    setDayTimeRanges([
      ...dayTimeRanges,
      { day: '', startTime: '08:00', endTime: '09:00' },
    ]);
    setOpen(true);
  };

  const handleDayChange = (value, index) => {
    const updatedDayTimeRanges = [...dayTimeRanges];
    updatedDayTimeRanges[index].day = value;
    setDayTimeRanges(updatedDayTimeRanges);
    persist(updatedDayTimeRanges);
  };

  const handleStartTimeChange = (value, index) => {
    const updatedDayTimeRanges = [...dayTimeRanges];
    updatedDayTimeRanges[index].startTime = value;
    setDayTimeRanges(updatedDayTimeRanges);
    persist(updatedDayTimeRanges);
  };

  const handleEndTimeChange = (value, index) => {
    const updatedDayTimeRanges = [...dayTimeRanges];
    updatedDayTimeRanges[index].endTime = value;
    setDayTimeRanges(updatedDayTimeRanges);
    persist(updatedDayTimeRanges);
  };

  const handleRemoveDayTimeRange = (index) => {
    const updatedDayTimeRanges = [...dayTimeRanges];
    updatedDayTimeRanges.splice(index, 1);
    setDayTimeRanges(updatedDayTimeRanges);
    persist(updatedDayTimeRanges);
  };

  const fab = {
    color: 'primary',
    sx: fabStyle,
    icon: <AddIcon />,
    label: 'Add',
  };

  return (
    <div>
      {/* <ToastContainer /> */}
      <BorderedBoxWithLabel label="Jours et heures" sx={{ display: 'flex' }}>
        <label>
          <Fab
            sx={fab.sx}
            aria-label={fab.label}
            color={fab.color}
            onClick={() => handleAddDayTimeRange()}
            component="button"
            disabled={!allValuesFilled}>
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
                  <Grid item xs={4} md={4} lg={4}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel id={`day-label-${index}`}>Jour</InputLabel>
                      <Select
                        size="small"
                        label="Jour"
                        labelId={`day-label-${index}`}
                        value={dayTimeRange ? dayTimeRange.day : ''}
                        onChange={(e) => handleDayChange(e.target.value, index)}
                        // error={!dayTimeRange.day} // Add error prop
                        // helpertext={
                        //   !dayTimeRange.day ? 'Ce champ est obligatoire' : ''
                        // }
                      >
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

                  <Grid item xs={3} md={3} lg={3}>
                    <TextField
                      size="small"
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
                        // 5 minutes in seconds (300 seconds)
                      }}
                    />
                  </Grid>

                  <Grid item xs={3} md={3} lg={3}>
                    <TextField
                      id="time"
                      size="small"
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
                        step: 300, // 5 minutes in seconds (300 seconds)
                      }}
                    />
                  </Grid>

                  <Grid item xs={1}>
                    <Button onClick={() => handleRemoveDayTimeRange(index)}>
                      <DeleteIcon sx={{ fontSize: 40 }} color="trash" />
                    </Button>
                  </Grid>
                </Grid>
              )
          )
        )}
        <Box sx={{ mt: 1, minHeight: 20 }}>
          <SaveStatus state={saveState} />
        </Box>
        <Snackbar
          open={open}
          autoHideDuration={10000}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}>
          <SnackbarContent
            style={{
              backgroundColor: 'white',
              color: 'purple',
              fontSize: '1rem',
            }}
            message={
              <span id="client-snackbar">
                Choisissez le jour et les heures : le créneau est enregistré
                automatiquement. Cliquez sur + pour en ajouter un autre.
              </span>
            }
          />
        </Snackbar>
      </BorderedBoxWithLabel>
    </div>
  );
};

export default DayTimeRangeComponent;
