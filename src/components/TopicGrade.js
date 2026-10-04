import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Button,
  Grid,
  MenuItem,
  TextField,
  Box,
  LinearProgress,
  Snackbar,
  SnackbarContent,
} from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import BorderedBoxWithLabel from './borderedBox';

// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

import { AuthContext } from '../AuthContext';

import { existingSubjects, existingClasses } from '../options/existingOptions';
import { useAutoSave } from '../js/useAutoSave';
import SaveStatus from './application/SaveStatus';

const fabStyle = {
  position: 'absolute',
  bottom: 10,
  right: 16,
};

const SubjectClassRangeComponent = ({ userSelected }) => {
  const location = useLocation();
  const [subjectClassRanges, setSubjectClassRanges] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // const { userLogged } = location.state;
  // const { token } = useContext(AuthContext);

  const [allValuesFilled, setAllValuesFilled] = useState(false);
  const [open, setOpen] = React.useState(false);

  // const subjectClassesRanges = userLogged.user.skill.topics
  // console.log(userSelected);
  const userId =
    location.state.userLogged.user.id === userSelected
      ? location.state.userLogged.user.id
      : userSelected;
  const [saveState, scheduleSave] = useAutoSave(userId, 'topics');

  // A subject is saved as soon as the subject and both levels are chosen
  const isComplete = (range) =>
    !!range.subject && !!range.classStart && !!range.classEnd;
  const persist = (ranges) =>
    scheduleSave(JSON.stringify(ranges.filter(isComplete)));
  // console.log('USERID', userId);
  const token = location.state.userLogged.token;

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  useEffect(() => {
    setIsLoading(false);
    const getSubjects = async () => {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/user-by-id/${userId}`
      );
      // console.log(response.data);
      if (response.data.skill) {
        const parsed_array = response.data.skill.topics.map((string) =>
          JSON.parse(string)
        );
        setSubjectClassRanges(parsed_array);
        setIsLoading(false);
      }
    };

    getSubjects();
  }, []);

  useEffect(() => {
    // Check if all values in all objects in dayTimeRanges are filled
    const allFilled = subjectClassRanges.every((subjectClassRange) => {
      return (
        subjectClassRange.subject !== '' &&
        subjectClassRange.classStart !== '' &&
        subjectClassRange.classEnd !== ''
      );
    });
    // Update allValuesFilled state accordingly
    setAllValuesFilled(allFilled);
  }, [subjectClassRanges]);

  const handleAddSubjectClassRange = () => {
    setSubjectClassRanges([
      ...subjectClassRanges,
      { subject: '', classStart: '', classEnd: '' },
    ]);
    setOpen(true);
  };

  const handleSubjectChange = (value, index) => {
    const updatedSubjectClassRanges = [...subjectClassRanges];
    updatedSubjectClassRanges[index].subject = value;
    setSubjectClassRanges(updatedSubjectClassRanges);
    persist(updatedSubjectClassRanges);
  };

  const handleClassStartChange = (value, index) => {
    const updatedSubjectClassRanges = [...subjectClassRanges];
    updatedSubjectClassRanges[index].classStart = value;
    setSubjectClassRanges(updatedSubjectClassRanges);
    persist(updatedSubjectClassRanges);
  };

  const handleClassEndChange = (value, index) => {
    const updatedSubjectClassRanges = [...subjectClassRanges];
    updatedSubjectClassRanges[index].classEnd = value;
    setSubjectClassRanges(updatedSubjectClassRanges);
    persist(updatedSubjectClassRanges);
  };

  const handleRemoveSubjectClassRange = (index) => {
    const updatedSubjectClassRanges = [...subjectClassRanges];
    updatedSubjectClassRanges.splice(index, 1);
    setSubjectClassRanges(updatedSubjectClassRanges);
    persist(updatedSubjectClassRanges);
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
      <BorderedBoxWithLabel
        label="Matières et classes"
        sx={{ display: 'flex' }}>
        <label>
          <Fab
            sx={fab.sx}
            aria-label={fab.label}
            color={fab.color}
            onClick={() => handleAddSubjectClassRange()}
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
          subjectClassRanges &&
          subjectClassRanges.map((subjectClassRange, index) => (
            <Grid
              mb={2}
              container
              spacing={1}
              key={index}
              style={{ marginTop: '16px' }}>
              <Grid item xs={4}>
                <TextField
                  size="small"
                  fullWidth
                  variant="outlined"
                  label="Matière"
                  select
                  value={
                    subjectClassRange.length !== 0 && subjectClassRange.subject
                  }
                  onChange={(e) => handleSubjectChange(e.target.value, index)}
                  // error={!subjectClassRange.subject} // Add error prop
                  // helperText={
                  //   !subjectClassRange.subject ? 'Ce champ est obligatoire' : ''
                  // }
                >
                  {existingSubjects.map((subject) => (
                    <MenuItem key={subject.label} value={subject.label}>
                      {subject.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={3}>
                <TextField
                  size="small"
                  fullWidth
                  variant="outlined"
                  label="Classe mini"
                  select
                  value={subjectClassRange.classStart}
                  onChange={(e) =>
                    handleClassStartChange(e.target.value, index)
                  }
                  // error={!subjectClassRange.classStart} // Add error prop
                  // helperText={
                  //   !subjectClassRange.classStart
                  //     ? 'Ce champ est obligatoire'
                  //     : ''
                  // }
                >
                  {existingClasses.map((classe, idx) => (
                    <MenuItem key={idx} value={classe}>
                      {classe}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={3}>
                <TextField
                  size="small"
                  fullWidth
                  variant="outlined"
                  label="Classe maxi"
                  select
                  value={subjectClassRange.classEnd}
                  onChange={(e) => handleClassEndChange(e.target.value, index)}>
                  {existingClasses.map((classe, idx) => (
                    <MenuItem key={idx} value={classe}>
                      {classe}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={2}>
                <Button onClick={() => handleRemoveSubjectClassRange(index)}>
                  <DeleteIcon sx={{ fontSize: 40 }} color="trash" />
                </Button>
              </Grid>
            </Grid>
          ))
        )}
        <Box sx={{ mt: 1, minHeight: 20 }}>
          <SaveStatus state={saveState} />
        </Box>
      </BorderedBoxWithLabel>
      <Snackbar
        open={open}
        autoHideDuration={10000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <SnackbarContent
          style={{
            backgroundColor: 'white',
            color: 'purple',
            fontSize: '1rem',
          }}
          message={
            <span id="client-snackbar">
              Choisissez la matière et les niveaux : elle est enregistrée
              automatiquement. Cliquez sur + pour en ajouter une autre.
            </span>
          }
        />
      </Snackbar>
    </div>
  );
};

export default SubjectClassRangeComponent;
