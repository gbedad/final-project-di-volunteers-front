import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
import BorderedBoxWithLabel from 'components/borderedBox';

// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from 'AuthContext';

import {
  existingSubjects,
  existingSubjectsPriorities,
} from 'options/existingOptions';

const fabStyle = {
  position: 'absolute',
  bottom: -10,
  right: 5,
};

const SubjectPriority = ({ studentId }) => {
  //   const location = useLocation();
  const [subjectPriorities, setSubjectPriorities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // const { userLogged } = location.state;
  // const { token } = useContext(AuthContext);

  const [showButton, setShowButton] = useState(false);
  const [allValuesFilled, setAllValuesFilled] = useState(false);
  const [open, setOpen] = React.useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  // const subjectClassesRanges = userLogged.user.skill.topics
  // console.log(userSelected);
  const userId = user.id;

  console.log(studentId);
  // console.log('USERID', userId);
  //   const token = location.state.userLogged.token;

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const getSubjects = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/students/${studentId}`
        );

        console.log('Raw topics data:', response.data.topics);

        if (isMounted && response.data.topics) {
          let parsedTopics;

          if (typeof response.data.topics === 'string') {
            // If topics is a JSON string, parse it once
            parsedTopics = JSON.parse(response.data.topics);
          } else if (Array.isArray(response.data.topics)) {
            // If topics is already an array, map through and parse each item if needed
            parsedTopics = response.data.topics.map((topic) =>
              typeof topic === 'string' ? JSON.parse(topic) : topic
            );
          } else {
            console.error('Unexpected topics format:', response.data.topics);
            parsedTopics = [];
          }

          console.log('Parsed topics:', parsedTopics);
          setSubjectPriorities(parsedTopics);
          setShowButton(false);
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
        // Optionally set an error state here
        // setError('Failed to fetch subjects');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    getSubjects();

    return () => {
      isMounted = false;
    };
  }, [studentId]);

  useEffect(() => {
    // Check if all values in all objects in dayTimeRanges are filled
    const allFilled = subjectPriorities.every((subjectPriority) => {
      return subjectPriority.subject !== '' && subjectPriority.priority !== '';
    });
    // Update allValuesFilled state accordingly
    setAllValuesFilled(allFilled);
  }, [subjectPriorities]);

  const handleAddSubjectPriority = () => {
    setSubjectPriorities([...subjectPriorities, { subject: '', priority: '' }]);
    setShowButton(true);
    setOpen(true);
  };

  const handleSubjectChange = (value, index) => {
    const updatedSubjectPriorities = [...subjectPriorities];
    updatedSubjectPriorities[index].subject = value;
    setSubjectPriorities(updatedSubjectPriorities);
    setShowButton(true);
  };

  const handleClassPriorityChange = (value, index) => {
    const updatedSubjectPriorities = [...subjectPriorities];
    updatedSubjectPriorities[index].priority = value;
    setSubjectPriorities(updatedSubjectPriorities);
    setShowButton(true);
  };

  const handleRemoveSubjectPriority = (index) => {
    const updatedSubjectPriorities = [...subjectPriorities];
    updatedSubjectPriorities.splice(index, 1);
    setSubjectPriorities(updatedSubjectPriorities);
    setShowButton(true);
  };

  console.log(subjectPriorities);

  const handleSaveSubjectPriorities = async () => {
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_BASE_URL}/students-topics/${studentId}`,
        { topics: subjectPriorities },
        {
          headers: {
            'Content-Type': 'application/json',
            // 'x-access-token': token,
          },
        }
      );
      console.log(response.data.updatedStudent);
      if (response.data) {
        // console.log('Subject and class ranges saved successfully');
        // toast.success(response.data.message, {
        //   position: 'top-center',
        // });
        setShowButton(false);
      } else {
        console.error('Failed to save subjects');
        // toast.error('Failed to save subjects', {
        //   position: 'top-center',
        // });
      }
    } catch (error) {
      // toast.error('Failed to save subjects', {
      //   position: 'top-center',
      // });
      console.error('Failed to save subject and class ranges', error);
    }
    // console.log('Saving subject and class ranges: ', subjectClassRanges);
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

      <label>
        <Fab
          sx={fab.sx}
          aria-label={fab.label}
          color={fab.color}
          onClick={() => handleAddSubjectPriority()}
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
        subjectPriorities &&
        subjectPriorities.map((subjectPriority, index) => (
          <Grid
            mb={2}
            container
            spacing={1}
            key={index}
            style={{ marginTop: '16px' }}>
            <Grid item xs={6}>
              <TextField
                size="small"
                fullWidth
                variant="outlined"
                label="Matière"
                select
                value={subjectPriority.length !== 0 && subjectPriority.subject}
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
            <Grid item xs={4}>
              <TextField
                size="small"
                fullWidth
                variant="outlined"
                label="Priority"
                select
                value={subjectPriority.priority}
                onChange={(e) =>
                  handleClassPriorityChange(e.target.value, index)
                }
                // error={!subjectClassRange.classStart} // Add error prop
                // helperText={
                //   !subjectClassRange.classStart
                //     ? 'Ce champ est obligatoire'
                //     : ''
                // }
              >
                {existingSubjectsPriorities.map((p, idx) => (
                  <MenuItem key={idx} value={p.label}>
                    {p.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={2}>
              <Button onClick={() => handleRemoveSubjectPriority(index)}>
                <DeleteIcon sx={{ fontSize: 40 }} color="trash" />
              </Button>
            </Grid>
          </Grid>
        ))
      )}
      {subjectPriorities && (
        <Button
          sx={{ marginTop: '10px' }}
          variant="contained"
          color="primary"
          onClick={handleSaveSubjectPriorities}>
          Enregistrer
        </Button>
      )}

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
              Vous pouvez ajouter plusieurs créneaux [matières] en cliquant à
              plusieurs reprises sur + avant de cliquer sur ENREGISTRER pour
              sauvegarder toutes les possibilités saisies.
            </span>
          }
        />
      </Snackbar>
    </div>
  );
};

export default SubjectPriority;
