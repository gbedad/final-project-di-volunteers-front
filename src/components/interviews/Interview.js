import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

import {
  TextField,
  Button,
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
  Alert,
  FormHelperText,
} from '@mui/material';
// import Zoom from '@mui/material/Zoom';
import Fab from '@mui/material/Fab';
// import LoadingButton from '@mui/lab/LoadingButton';
import AddIcon from '@mui/icons-material/Add';
// import SaveIcon from '@mui/icons-material/Save';
import CheckIcon from '@mui/icons-material/Check';
// import TextareaAutosize from '@mui/material/TextareaAutosize';
// import { styled } from '@mui/system';
// import dayjs from 'dayjs';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { DateField } from '@mui/x-date-pickers/DateField';
// import NativeSelect from '@mui/material/NativeSelect';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CallFeatureToggle from './CallfeatureToggle';

// const blue = {
//   100: '#DAECFF',
//   200: '#b6daff',
//   400: '#3399FF',
//   500: '#007FFF',
//   600: '#0072E5',
//   900: '#003A75',
// };

// const grey = {
//   50: '#f6f8fa',
//   100: '#eaeef2',
//   200: '#d0d7de',
//   300: '#afb8c1',
//   400: '#8c959f',
//   500: '#6e7781',
//   600: '#57606a',
//   700: '#424a53',
//   800: '#32383f',
//   900: '#24292f',
// };

// const StyledTextarea = styled(TextareaAutosize)(
//   ({ theme }) => `

//     font-family: IBM Plex Sans, sans-serif;
//     font-size: 0.875rem;
//     font-weight: 400;
//     line-height: 1.5;
//     padding: 12px;
//     border-radius: 5px 5px 0 5px;
//     color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
//     background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
//     border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
//     box-shadow: 0px 2px 2px ${
//       theme.palette.mode === 'dark' ? grey[900] : grey[50]
//     };

//     &:hover {
//       border-color: ${blue[400]};
//     }

//     &:focus {
//       border-color: ${blue[400]};
//       box-shadow: 0 0 0 3px ${
//         theme.palette.mode === 'dark' ? blue[500] : blue[200]
//       };
//     }

//     // firefox
//     &:focus-visible {
//       outline: 0;
//     }
//   `
// );
// function a11yProps(index) {
//   return {
//     id: `action-tab-${index}`,
//     'aria-controls': `action-tabpanel-${index}`,
//   };
// }

const fabStyle = {
  position: 'absolute',
  bottom: 16,
  right: 16,
};

// const BASE_URL = process.env.REACT_APP_BASE_URL;

// Assessments about what the mission needs, not verdicts on the person: the
// volunteer may read everything recorded about them (RGPD, right of access)
const FOLLOWUP_VALUES = ['Oui', 'Avec accompagnement', 'Pas pour le moment'];
const FRENCH_VALUES = ['Vérifiée', 'À vérifier', 'Attestée par les écrits'];
const RECOMMENDATION_VALUES = ['À retenir', 'Ne pas retenir', 'À revoir'];
const EXPERIENCE_VALUES = ['Confirmée', 'Quelques expériences', 'Débutant(e)'];
const FOLLOWUP_MAP = {
  'Pourquoi pas': 'Avec accompagnement',
  'A éviter': 'Pas pour le moment',
  'À éviter': 'Pas pour le moment',
  Non: 'Pas pour le moment',
};
const FRENCH_MAP = {
  Requis: 'À vérifier',
  'Pas nécessaire': 'Attestée par les écrits',
  'Non nécessaire': 'Attestée par les écrits',
};
const RECOMMENDATION_MAP = {
  'A recruter': 'À retenir',
  'A ne pas recruter': 'Ne pas retenir',
  NSP: 'À revoir',
};
const modernize = (iv) => ({
  ...iv,
  followup: FOLLOWUP_MAP[iv.followup] || iv.followup,
  test: FRENCH_MAP[iv.test] || iv.test,
  recommendation: RECOMMENDATION_MAP[iv.recommendation] || iv.recommendation,
});

// Data that must not be written in an interview report (special categories,
// family life, age…): a reminder, never a block
const SENSITIVE = [
  ['santé', /(malade|maladie|santé|enceinte|grossesse|cancer|dépression|déprim|médica|traitement médical|hospitalis|burn.?out|thérapie)/i],
  ['religion', /(religi|musulman|juif|juive|chrétien|catholique|protestant|bouddhiste|voilée?\b|kippa|ramadan|shabbat|mosquée|église|synagogue)/i],
  ['origine', /(origine|nationalité|étranger|étrangère|immigr|ethni|couleur de peau|accent)/iu],
  ['opinions', /(politique|syndica|militant)/i],
  ['vie familiale', /(divorc|séparée? de|veu(f|ve)|conjoint|\b(ses|sa|son|leurs?)\s+(\S+\s+)?(fils|filles?|garçons|enfants|petits-enfants)\b|nièce|neveu)/iu],
  ['âge', /(^|\D)\d{2}\s?ans\b/i],
];
const sensitiveHint = (text) => {
  const found = SENSITIVE.filter(([, re]) => re.test(text || '')).map(([l]) => l);
  return found.length
    ? `À vérifier : ce texte semble mentionner ${found.join(', ')}. N'écrivez que ce qui est utile à la mission.`
    : '';
};

const FormInterviewComponent = ({ userId }) => {
  const location = useLocation();
  // eslint-disable-next-line no-unused-vars
  const [isLoading, setIsLoading] = useState(true);
  // const [title, setTitle] = useState('');
  const [showButton, setShowButton] = useState(false);
  // const [content, setContent] = useState('');
  // const [records, setRecords] = useState([]);
  // const [date, setDate] = React.useState(dayjs(Date.now()));
  const [interviews, setInterviews] = useState([]);
  const [confirmed, setConfirmed] = useState(false);
  const [countInterviews, setCountInterviews] = useState(0);
  const [isDateValid, setIsDateValid] = useState(true);

  const userToken = location.state.userLogged.token;
  const userLogged = location.state.userLogged.user.first_name;

  //   const handleTitleChange = (event) => {
  //     setTitle(event.target.value);
  //   };

  //   const handleDateChange = (event) => {
  //     setDate(event.target.value);
  //   };

  useEffect(() => {
    const getInterviews = async () => {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/user-by-id/${userId}`
      );
      // console.log(response.data);
      if (response.data.interviews) {
        // Former wording shown with the current one
        const parsed_array = response.data.interviews.map((string) => {
          let v = string;
          for (let i = 0; i < 3 && typeof v === 'string'; i += 1) v = JSON.parse(v);
          return modernize(v);
        });
        setInterviews(parsed_array);
        setIsLoading(false);
        setShowButton(false);
      }
      setIsLoading(false);
      if (interviews.length > 0) {
        const activeItems = interviews.filter((item) => item.isActive);
        const activeCount = activeItems.length;
        // console.log(activeCount);
        setCountInterviews(activeCount);
        // setConfirmed(true);
      }
    };

    getInterviews();
  }, [userId, confirmed]);

  // Check if all values are filled in interviews
  const areAllKeysNonNullOrEmpty = (arr) => {
    return arr.every((obj) =>
      Object.values(obj).every((value) => value !== null && value !== '')
    );
  };

  const handleTitleChange = (value, index) => {
    const updatedInterviews = [...interviews];
    updatedInterviews[index].title = value;
    setInterviews(updatedInterviews);
  };

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
    setInterviews((prevInterviews) => {
      const updatedInterviews = [...prevInterviews];
      updatedInterviews[index][key] = value;
      return updatedInterviews;
    });
  };

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

  const handleAddInterview = () => {
    let count = 1;
    if (interviews.length > 0) {
      count = interviews.length + 1;
    }
    // console.log(count);
    // const dateToday = new Date().toLocaleDateString();
    // console.log(dateToday);

    setInterviews([
      ...interviews,
      {
        title: `Entretien ${count}`,
        date: '',
        motivation: '',

        content: '',
        by: userLogged,
        isActive: false,
      },
    ]);
    setConfirmed(false);
    setShowButton(true);
  };
  const result = areAllKeysNonNullOrEmpty(interviews);
  // console.log(result);

  const handleSaveInterviews = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/add-interviews/${userId}`,
        { interviews },
        {
          headers: {
            'Content-Type': 'application/json',
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
  const fab = {
    color: 'primary',
    sx: fabStyle,
    icon: <AddIcon />,
    label: 'Add',
  };
  // console.log(interviews);

  return (
    <div>
      <Typography
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
      </Typography>

      <label>
        <Fab
          sx={fab.sx}
          aria-label={fab.label}
          color={fab.color}
          onClick={() => handleAddInterview()}
          disabled={showButton}
          component="button">
          {fab.icon}
        </Fab>
      </label>

      {interviews &&
        interviews.map((interview, index) => (
          <Grid spacing={2} pb={5}>
            <Grid item xs={12} key={index}>
              <Stack direction="row" spacing={2} mb={2}>
                <TextField
                  size="small"
                  label="Title"
                  value={interview.title}
                  onChange={(e) => handleTitleChange(e.target.value, index)}
                  width={'50%'}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />

                {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Date de l'entretien"
                    value={interview.date}
                    onChange={(newDate) => handleDateChange(newDate, index)}
                  />
                </LocalizationProvider> */}
                <FormControl>
                  <InputLabel id="demo-simple-select-helper-label"></InputLabel>
                  <TextField
                    required={true}
                    size="small"
                    label="Date de l'entretien"
                    type="date"
                    defaultValue={new Date().toISOString()}
                    value={interview.date}
                    error={!isDateValid}
                    helperText={!isDateValid && 'Please select a valid date.'}
                    onChange={(e) => handleDateChange(e.target.value, index)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
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
            {/* <Grid item xs={12}>
              <FormControl sx={{ minWidth: '100%' }}>
                <StyledTextarea
                  required={true}
                  aria-label="Textarea"
                  label="Contenu de l'entretien"
                  minRows={3}
                  placeholder="Saisir le compte-rendu de l'entretien."
                  value={interview.content}
                  onChange={(e) => handleContentChange(e.target.value, index)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </FormControl>
            </Grid> */}
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header">
                <Typography variant="h6">Détails</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Notez uniquement ce qui est utile à la mission : expérience,
                  pédagogie, disponibilités, points d'attention pour le
                  tutorat. Pas d'âge, de santé, de religion, d'opinions,
                  d'origine ni de vie familiale. Le bénévole peut demander à
                  lire ce compte-rendu.
                </Alert>
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
                      label="Qu'est-ce qui motive le souhait d'être bénévole ? En particulier dans l'accompagnement aux apprentissages ?"
                      multiline
                      minRows={1}
                      placeholder=""
                      value={interview.motivation}
                      helperText={sensitiveHint(interview.motivation)}
                      FormHelperTextProps={{ sx: { color: 'warning.dark' } }}
                      onChange={(e) =>
                        handleInterviewChange(
                          'motivation',
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
                      label="Quelle expérience de l'accompagnement aux apprentissages ?"
                      multiline
                      minRows={1}
                      placeholder=""
                      value={interview.experience}
                      helperText={sensitiveHint(interview.experience)}
                      FormHelperTextProps={{ sx: { color: 'warning.dark' } }}
                      onChange={(e) =>
                        handleInterviewChange(
                          'experience',
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
                      label="Comment accompagner un enfant qui rencontre des difficultés ?"
                      multiline
                      minRows={1}
                      placeholder=""
                      value={interview.how_tutoring}
                      helperText={sensitiveHint(interview.how_tutoring)}
                      FormHelperTextProps={{ sx: { color: 'warning.dark' } }}
                      onChange={(e) =>
                        handleInterviewChange(
                          'how_tutoring',
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
                      label="Questions personnalisées (relatives au CV, à un point d'attention, etc.)"
                      multiline
                      minRows={1}
                      placeholder=""
                      value={interview.personal_questions}
                      helperText={sensitiveHint(interview.personal_questions)}
                      FormHelperTextProps={{ sx: { color: 'warning.dark' } }}
                      onChange={(e) =>
                        handleInterviewChange(
                          'personal_questions',
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
                      label="Évaluation détaillée"
                      multiline
                      minRows={1}
                      placeholder=""
                      value={interview.content}
                      helperText={sensitiveHint(interview.content)}
                      FormHelperTextProps={{ sx: { color: 'warning.dark' } }}
                      // onChange={(e) =>
                      //   handleInterviewChange(e.target.value, index)
                      // }
                      onChange={(e) =>
                        handleInterviewChange('content', e.target.value, index)
                      }
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </FormControl>
                </Grid>
              </AccordionDetails>
            </Accordion>
            <Grid item={12}>
              <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1} mb={2} mt={2}>
                <FormControl required sx={{ m: 1, flex: '1 1 240px', minWidth: 0 }}>
                  <InputLabel shrink id="demo-simple-select-standard-label">
                    Recommandation
                  </InputLabel>

                  <Select
                    size="small"
                    notched
                    fullWidth
                    labelId="demo-simple-select-standard-label"
                    id="demo-simple-select-standard"
                    label="Recommandation *"
                    value={interview.recommendation}
                    onChange={(e) =>
                      handleInterviewChange(
                        'recommendation',
                        e.target.value,
                        index
                      )
                    }>
                    {RECOMMENDATION_VALUES.map((v) => (
                      <MenuItem key={v} value={v}>
                        {v}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl required sx={{ m: 1, flex: '1 1 240px', minWidth: 0 }}>
                  <InputLabel shrink id="demo-simple-select-standard-label">
                    Suivi d'élèves en grande difficulté
                  </InputLabel>

                  <Select
                    size="small"
                    notched
                    fullWidth
                    labelId="demo-simple-select-standard-label"
                    id="demo-simple-select-standard"
                    label="Suivi d'élèves en grande difficulté *"
                    value={interview.followup}
                    onChange={(e) =>
                      handleInterviewChange('followup', e.target.value, index)
                    }>
                    {FOLLOWUP_VALUES.map((v) => (
                      <MenuItem key={v} value={v}>
                        {v}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Grid>
            <Grid item={12}>
              <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1} mb={2}>
                <FormControl required sx={{ m: 1, flex: '1 1 240px', minWidth: 0 }}>
                  <InputLabel shrink id="demo-simple-select-standard-label">
                    Maîtrise du français écrit
                  </InputLabel>

                  <Select
                    size="small"
                    notched
                    fullWidth
                    labelId="demo-simple-select-standard-label"
                    id="demo-simple-select-standard"
                    label="Maîtrise du français écrit *"
                    value={interview.test}
                    onChange={(e) =>
                      handleInterviewChange('test', e.target.value, index)
                    }>
                    {FRENCH_VALUES.map((v) => (
                      <MenuItem key={v} value={v}>
                        {v}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    Même critère pour tous les candidats (écrits, CV, test)
                  </FormHelperText>
                </FormControl>
                <FormControl required sx={{ m: 1, flex: '1 1 240px', minWidth: 0 }}>
                  <InputLabel shrink id="demo-simple-select-standard-label">
                    Expérience pédagogique
                  </InputLabel>

                  <Select
                    size="small"
                    notched
                    fullWidth
                    labelId="demo-simple-select-standard-label"
                    id="demo-simple-select-standard"
                    label="Expérience pédagogique *"
                    value={interview.experience_level || ''}
                    onChange={(e) =>
                      handleInterviewChange(
                        'experience_level',
                        e.target.value,
                        index
                      )
                    }>
                    {EXPERIENCE_VALUES.map((v) => (
                      <MenuItem key={v} value={v}>
                        {v}
                      </MenuItem>
                    ))}
                  </Select>
                  {interview.aptitudes && (
                    <FormHelperText>
                      Ancienne évaluation « aptitudes » : {interview.aptitudes}
                    </FormHelperText>
                  )}
                </FormControl>
                <FormControl required sx={{ m: 1, flex: '1 1 240px', minWidth: 0 }}>
                  <InputLabel shrink id="demo-simple-select-standard-label">
                    Formations
                  </InputLabel>

                  <Select
                    size="small"
                    notched
                    fullWidth
                    labelId="demo-simple-select-standard-label"
                    id="demo-simple-select-standard"
                    label="Formations *"
                    value={interview.training}
                    onChange={(e) =>
                      handleInterviewChange('training', e.target.value, index)
                    }>
                    <MenuItem value={'Requises'}>Requises</MenuItem>
                    <MenuItem value={'A proposer'}>A proposer</MenuItem>
                    <MenuItem value={'Pas nécessaires'}>
                      Pas nécessaires
                    </MenuItem>
                    <MenuItem value={'NSP'}>NSP</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Grid>
            <Grid item xs={12} mt={2}>
              <Typography
                sx={{
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  fontSize: '0.875rem',
                  color: 'primary.main',
                }}>
                Entretien réalisé par {interview.by}
              </Typography>
            </Grid>
            <Grid item xs={12}></Grid>
          </Grid>
        ))}

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
