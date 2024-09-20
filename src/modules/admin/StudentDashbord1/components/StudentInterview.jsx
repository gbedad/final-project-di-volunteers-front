import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

import {
  TextField,
  Box,
  Button,
  Divider,
  Typography,
  Grid,
  Select,
  MenuItem,
  Stack,
  Chip,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
} from '@mui/material';

import Fab from '@mui/material/Fab';

import AddIcon from '@mui/icons-material/Add';

import CheckIcon from '@mui/icons-material/Check';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CallFeatureToggle from 'components/interviews/CallfeatureToggle';

import { existingStudentPriorities } from 'options/existingOptions';
import SubjectDecidedPriority from './StudentDecideTopic';

// const fabStyle = {
//   position: 'absolute',
//   bottom: 16,
//   right: 16,
// };

// const BASE_URL = process.env.REACT_APP_BASE_URL;

const FormInterviewComponent = ({ studentId, user }) => {
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(true);

  const [showButton, setShowButton] = useState(false);
  console.log(studentId);

  const [interviews, setInterviews] = useState([
    {
      date: '',
      by: '',
      motivation_student: '',
      difficulties_student: '',
      other_oservations_student: '',
      motivation: '',
      difficulties: '',
      other_oservations: '',
      priority: '',
      decision: '',
      subjects: [],
    },
  ]);
  const [confirmed, setConfirmed] = useState(false);
  const [countInterviews, setCountInterviews] = useState(0);
  const [isDateValid, setIsDateValid] = useState(true);

  const userLogged = user.first_name;

  useEffect(() => {
    const getInterviews = async () => {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/students/${studentId}`
      );
      const isInterviewsEmpty =
        !response.data.interviews ||
        (typeof response.data.interviews === 'object' &&
          Object.keys(response.data.interviews).length === 0);
      // console.log(isInterviewsEmpty);
      // Check if the response data is an empty object
      if (isInterviewsEmpty) {
        // Initialize with a default array containing one empty interview object

        setInterviews([
          {
            date: '',
            by: '',
            motivation_student: '',
            difficulties_student: '',
            other_obbservations_student: '',
            motivation: '',
            difficulties: '',
            other_oservations: '',
            priority: '',
            decision: '',
            subjects: [],
          },
        ]);
      } else {
        const parsed_array = JSON.parse(response.data.interviews);

        // setInterviews(parsed_array);
        setIsLoading(false);
        // setShowButton(false);

        setInterviews(Array.from(parsed_array));

        setIsLoading(false);
      }
    };
    getInterviews();
  }, [studentId, confirmed]);

  // console.log(interviews);

  // Check if all values are filled in interviews
  const areAllKeysNonNullOrEmpty = (arr) => {
    return arr.every((obj) =>
      Object.values(obj).every((value) => value !== null && value !== '')
    );
  };

  // const handleByChange = (value, index) => {
  //   const updatedInterviews = [...interviews];
  //   updatedInterviews[index].by = value;
  //   setInterviews(updatedInterviews);
  // };

  const handleDateChange = (value, index) => {
    const updatedInterviews = [...interviews];
    updatedInterviews[index].date = value;
    setIsDateValid(value !== '');
    setInterviews(updatedInterviews);
  };

  //   const handleDateChange = (value) => {
  //     setInterviews((prevInterviews) => ({ ...prevInterviews, date: value }));
  //   };

  // const handleContentChange = (value, index) => {
  //   const updatedInterviews = [...interviews];
  //   updatedInterviews[index].content = value;
  //   setInterviews(updatedInterviews);
  // };

  const handleInterviewChange = (key, value, index) => {
    setInterviews((interviews) => {
      const updatedInterviews = [...interviews];
      updatedInterviews[index][key] = value;
      return updatedInterviews;
    });
  };

  // console.log(interviews);

  // function parseInterviews(data) {
  //   const parsedData = data.map((interview) => {
  //     const { title, date, content } = JSON.parse(interview);
  //     return {
  //       title,
  //       date,
  //       content,
  //       by: { userLogged },
  //     };
  //   });
  //   return parsedData;
  // }
  //   const parsedInterviews = parseInterviews(data);

  //   console.log(parsedInterviews);

  //   useEffect(() => {
  //     setInterviews([...parseInterviews]);
  //   }, []);

  //   const handleAddRecord = () => {
  //     if (title && date && textarea) {
  //       const newRecord = {
  //         title: title,
  //         date: date,
  //         textarea: textarea,
  //       };
  //       setRecords([...records, newRecord]);
  //       setTitle('');
  //       setDate('');
  //       setTextarea('');
  //     }
  //   };
  // console.log(interviews);
  //   const handleAddInterview = () => {
  //     if (title && date && content) {
  //       const newInterview = {
  //         title: title,
  //         date: date,
  //         content: content,
  //       };
  //       setInterviews([...interviews, newInterview]);
  //       setTitle('');
  //       setDate('');
  //       setContent('');
  //     }
  //   };

  // const handleAddInterview = () => {
  //   let count = 1;
  //   if (interviews.length > 0) {
  //     count = interviews.length + 1;
  //   }
  //   // console.log(count);
  //   // const dateToday = new Date().toLocaleDateString();
  //   // console.log(dateToday);

  //   setInterviews([
  //     ...interviews,
  //     {
  //       date: '',
  //       priority: '',

  //       by: '',
  //       isActive: false,
  //     },
  //   ]);
  //   setConfirmed(false);
  //   setShowButton(true);
  // };
  // const result = areAllKeysNonNullOrEmpty(interviews);
  // console.log(result);

  const handleSaveInterviews = async () => {
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_BASE_URL}/students-interview/${studentId}`,
        { interviews },
        {
          headers: {
            'Content-Type': 'application/json',
            // 'x-access-token': userToken,
          },
        }
      );
      setShowButton(false);
      // console.log(response.data);
      if (response.data.message === 'Interviews saved successfully') {
        // const result = areAllKeysNonNullOrEmpty(response.data);
        // if (result) {
        //   setConfirmed(true);
        // }

        console.log('Interview saved successfully');
      } else {
        console.error('Failed to save interview');
      }
    } catch (error) {
      console.error('Failed to save interview', error);
    }
  };
  // const fab = {
  //   color: 'primary',
  //   sx: fabStyle,
  //   icon: <AddIcon />,
  //   label: 'Add',
  // };
  // console.log(interviews);

  return (
    <div>
      {/* <Typography
        variant="h6"
        component="h6"
        align="center"
        mb={2}
        sx={{ fontWeight: 400 }}>
        {countInterviews > 0 && (
          <Chip
            label={
              countInterviews === 1
                ? `${countInterviews} entretien réalisé`
                : `${countInterviews} entretiens réalisés`
            }
            size="normal"
          />
        )}
      </Typography> */}
      <label>
        {/* <Fab
          sx={fab.sx}
          aria-label={fab.label}
          color={fab.color}
          onClick={() => handleAddInterview()}
          disabled={showButton}
          component="button">
          {fab.icon}
        </Fab> */}
      </label>

      {interviews.map((interview, index) => (
        <Grid spacing={2} pb={5}>
          <Grid item xs={12} key={index}>
            <Stack direction="row" spacing={2} mb={2}>
              <FormControl>
                <InputLabel id="demo-simple-select-helper-label"></InputLabel>
                <TextField
                  required={true}
                  size="small"
                  label="Date de l'entretien"
                  type="date"
                  // defaultValue={new Date().toISOString()}
                  value={interview.date}
                  error={!isDateValid}
                  helperText={!isDateValid && 'Please select a valid date.'}
                  onChange={(e) => handleDateChange(e.target.value, index)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </FormControl>
              <FormControl required sx={{ m: 1, width: 250 }} size="small">
                <InputLabel shrink id="demo-simple-select-standard-label">
                  Réalisé par
                </InputLabel>
                <Select
                  notched
                  autoWidth
                  labelId="demo-simple-select-standard-label"
                  id="demo-simple-select-standard"
                  label="Réalisé par"
                  value={'' || interview.by}
                  onChange={(e) =>
                    handleInterviewChange('by', e.target.value, index)
                  }
                  isoptionequaltovalue={(option, value) =>
                    value === '' || option.id === value.id
                  }>
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value={'Noemie Rolland'}>Noemie Rolland</MenuItem>
                  <MenuItem value={'Corinne Zuili'}>Corinne Zuili</MenuItem>
                  <MenuItem value={'Emmanuelle Berrebi'}>
                    Emmanuelle Berrebi
                  </MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <FormControlLabel
              control={
                <Switch
                  checked={interview.isActive}
                  onChange={(e) =>
                    handleInterviewChange('isActive', e.target.checked, index)
                  }
                  name="callFeatureToggle"
                  color="primary"
                />
              }
              label="Entretien réalisé"
            />
          </Grid>

          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header">
              <Typography variant="h6">
                Selon le(s) parent(s) et l'élève
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid item xs={12}>
                <FormControl
                  sx={{
                    minWidth: '100%',
                    // mt: 2,
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    fontSize: '12px',
                    fontWeight: '400',
                  }}>
                  <TextField
                    id="outlined-multiline-static"
                    label="Quel est le motif de la demande d'accompagnement ?"
                    multiline
                    minRows={1}
                    placeholder=""
                    value={interview.motivation_student}
                    onChange={(e) =>
                      handleInterviewChange(
                        'motivation_student',
                        e.target.value,
                        index
                      )
                    }
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl
                  sx={{
                    minWidth: '100%',
                    mt: 2,
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    fontSize: '0.4rem',
                    fontWeight: '400',
                    lineHeight: '1.5',
                  }}>
                  <TextField
                    id="outlined-multiline-static"
                    label="Quelle est la nature des difficultés rencontrées ?"
                    multiline
                    minRows={1}
                    placeholder=""
                    value={interview.difficulties_student}
                    onChange={(e) =>
                      handleInterviewChange(
                        'difficulties_student',
                        e.target.value,
                        index
                      )
                    }
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl
                  sx={{
                    minWidth: '100%',
                    mt: 2,
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    fontSize: '0.4rem',
                    fontWeight: '400',
                    lineHeight: '1.5',
                  }}>
                  <TextField
                    id="outlined-multiline-static"
                    label="Autre ?"
                    multiline
                    minRows={1}
                    placeholder=""
                    value={interview.other_student}
                    onChange={(e) =>
                      handleInterviewChange(
                        'other_student',
                        e.target.value,
                        index
                      )
                    }
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </FormControl>
              </Grid>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header">
              <Typography variant="h6">Selon l'interviewer'</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid item xs={12}>
                <FormControl
                  sx={{
                    minWidth: '100%',
                    // mt: 2,
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    fontSize: '12px',
                    fontWeight: '400',
                  }}>
                  <TextField
                    id="outlined-multiline-static"
                    label="Quel serait l'object de l'accompagnement ?"
                    multiline
                    minRows={1}
                    placeholder=""
                    value={interview.motivation}
                    onChange={(e) =>
                      handleInterviewChange('motivation', e.target.value, index)
                    }
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl
                  sx={{
                    minWidth: '100%',
                    mt: 2,
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    fontSize: '0.4rem',
                    fontWeight: '400',
                    lineHeight: '1.5',
                  }}>
                  <TextField
                    id="outlined-multiline-static"
                    label="Quelle est la nature des difficultés rencontrées ?"
                    multiline
                    minRows={1}
                    placeholder=""
                    value={interview.difficulties}
                    onChange={(e) =>
                      handleInterviewChange(
                        'difficulties',
                        e.target.value,
                        index
                      )
                    }
                    // value={interview.motivation}
                    // onChange={(e) =>
                    //   handleContentChange(e.target.value, index)
                    // }
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl
                  sx={{
                    minWidth: '100%',
                    mt: 2,
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    fontSize: '0.4rem',
                    fontWeight: '400',
                    lineHeight: '1.5',
                  }}>
                  <TextField
                    id="outlined-multiline-static"
                    label="Quelles autres observations (timidité, difficultés de concentration...) ?"
                    multiline
                    minRows={1}
                    placeholder=""
                    value={interview.other_observations}
                    onChange={(e) =>
                      handleInterviewChange(
                        'other_observations',
                        e.target.value,
                        index
                      )
                    }
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </FormControl>
              </Grid>
            </AccordionDetails>
          </Accordion>
          <Divider />
          <Grid item={12}>
            <Typography p={2} variant="h6">
              Décision
            </Typography>
            <Stack direction="row" spacing={2} mb={2} mt={2}>
              <FormControl required sx={{ m: 1, width: 300 }}>
                <InputLabel shrink id="demo-simple-select-standard-label">
                  Décision
                </InputLabel>

                <Select
                  size="small"
                  notched
                  autoWidth
                  labelId="demo-simple-select-standard-label"
                  id="demo-simple-select-standard"
                  label="Décision *"
                  value={interview.decision}
                  onChange={(e) =>
                    handleInterviewChange('decision', e.target.value, index)
                  }>
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value={'Chercher un tuteur'}>
                    Chercher un tuteur
                  </MenuItem>
                  <MenuItem value={'temporiser'}>Temporiser</MenuItem>
                  <MenuItem value={'Décliner'}>Décliner</MenuItem>
                </Select>
              </FormControl>

              <FormControl required sx={{ m: 1, width: 150 }}>
                <InputLabel shrink id="demo-simple-select-standard-label">
                  Priorité
                </InputLabel>

                <Select
                  size="small"
                  notched
                  autoWidth
                  labelId="demo-simple-select-standard-label"
                  id="demo-simple-select-standard"
                  label="Priorité *"
                  value={interview.priority}
                  onChange={(e) =>
                    handleInterviewChange('priority', e.target.value, index)
                  }>
                  {existingStudentPriorities.map((priority) => (
                    <MenuItem key={priority.label} value={priority.label}>
                      {priority.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Grid>
          <Divider />
          {/* 
          <Grid item xs={12} sx={{ position: 'relative' }}>
            <SubjectDecidedPriority studentId={studentId} />
          </Grid> */}
        </Grid>
      ))}
      {/* <Box mt={3} mb={3}>
        <Divider />
      </Box> */}
      <Button
        // disabled={!showButton}
        startIcon={confirmed ? <CheckIcon /> : ''}
        variant="contained"
        color={confirmed ? 'primary' : 'primary'}
        onClick={handleSaveInterviews}>
        {confirmed ? 'RÉALISÉ(S)' : 'CONFIRMER'}
      </Button>
    </div>
  );
};

export default FormInterviewComponent;
