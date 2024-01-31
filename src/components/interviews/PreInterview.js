import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  TextField,
  Button,
  Grid,
  Select,
  MenuItem,
  Stack,
  FormControl,
  InputLabel,
} from '@mui/material';

// import AddIcon from '@mui/icons-material/Add';

import CheckIcon from '@mui/icons-material/Check';
// import TextareaAutosize from '@mui/material/TextareaAutosize';
// import { styled } from '@mui/system';
// import dayjs from 'dayjs';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { DateField } from '@mui/x-date-pickers/DateField';
// import NativeSelect from '@mui/material/NativeSelect';

// import Accordion from '@mui/material/Accordion';
// import AccordionSummary from '@mui/material/AccordionSummary';
// import AccordionDetails from '@mui/material/AccordionDetails';

// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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

// const BASE_URL = process.env.REACT_APP_BASE_URL;

const PreInterviewComponent = ({ userId }) => {
  const location = useLocation();
  // eslint-disable-next-line no-unused-vars
  const [isLoading, setIsLoading] = useState(true);

  // const [content, setContent] = useState('');
  // const [date, setDate] = React.useState(dayjs(Date.now()));
  const [preInterview, setPreInterview] = useState({
    date: '',
    by: '',
    evaluation: '',
    nextStep: '',
  });
  const [confirmed, setConfirmed] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [isDateValid, setIsDateValid] = useState(true);
  const [showButton, setShowButton] = useState(false);

  const userToken = location.state.userLogged.token;
  // const userLogged = location.state.userLogged.user.first_name;

  useEffect(() => {
    const getPreInterview = async () => {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/user-by-id/${userId}`
      );
      // console.log('=====>', response.data);
      let preInterviewdata;
      try {
        if (Object.keys(response.data.pre_interview).length === 0) {
          preInterviewdata = {
            date: '',
            by: '',
            evaluation: '',
            nextStep: '',
          };
          setPreInterview(preInterviewdata);
        } else if (Object.keys(response.data.pre_interview).length !== 0) {
          preInterviewdata = response.data.pre_interview;

          setPreInterview(JSON.parse(preInterviewdata));
          setIsLoading(false);
        } else {
          setIsLoading(false);
          return true;
        }
      } catch (error) {
        console.log(error);
      }
    };

    getPreInterview();
  }, [userId]);

  const updatePreInterview = (field, value) => {
    setPreInterview((prevState) => ({
      ...prevState,
      [field]: value,
    }));
    console.log(preInterview);
    if (
      preInterview.date !== '' &&
      preInterview.by !== '' &&
      preInterview.evaluation !== ''
    ) {
      setShowButton(true);
    }
  };

  const handleSavePreInterview = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/add-pre-interview/${userId}`,
        { preInterview },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': userToken,
          },
        }
      );
      // console.log(response.data.message);
      if (response.data.message) {
        setConfirmed(true);
        console.log('Pre Interview saved successfully');
        setShowButton(false);
      } else {
        console.error('Failed to save interview');
      }
    } catch (error) {
      console.error('Failed to save interview', error);
    }
  };

  return (
    <div>
      <Grid spacing={2} pb={5} pt={2}>
        <Grid item xs={12}>
          <Stack direction="row" spacing={2} mb={2}>
            <FormControl>
              <InputLabel id="demo-simple-select-helper-label"></InputLabel>
              <TextField
                required={true}
                size="small"
                label="Date de l'entretien"
                type="date"
                defaultValue={new Date().toISOString()}
                value={preInterview.date}
                error={!isDateValid}
                helperText={!isDateValid && 'Please select a valid date.'}
                onChange={(e) => updatePreInterview('date', e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </FormControl>
            <FormControl required sx={{ m: 1, width: 300 }} size="small">
              <InputLabel shrink id="demo-simple-select-standard-label">
                Réalisé par
              </InputLabel>
              <Select
                notched
                autoWidth
                labelId="demo-simple-select-standard-label"
                id="demo-simple-select-standard"
                label="Réalisé par"
                value={preInterview.by}
                onChange={(e) => updatePreInterview('by', e.target.value)}>
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
              label="Évaluation"
              multiline
              minRows={1}
              placeholder=""
              value={preInterview.evaluation}
              onChange={(e) => updatePreInterview('evaluation', e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </FormControl>
        </Grid>

        <Grid item={12}>
          <Stack direction="row" spacing={2} mb={2} mt={2}>
            <FormControl required sx={{ m: 1, width: 300 }} size="small">
              <InputLabel shrink id="demo-simple-select-standard-label">
                Prochaine étape
              </InputLabel>
              <Select
                notched
                autoWidth
                labelId="demo-simple-select-standard-label"
                id="demo-simple-select-standard"
                label="Recommandation *"
                value={preInterview.nextStep}
                onChange={(e) =>
                  updatePreInterview('nextStep', e.target.value)
                }>
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value={'A interviewer'}>A interviewer</MenuItem>
                <MenuItem value={'Ne pas donner suite'}>
                  Ne pas donner suite
                </MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Grid>

        <Grid item xs={12}></Grid>
      </Grid>

      <Button
        disabled={!showButton}
        startIcon={confirmed ? <CheckIcon /> : ''}
        variant="contained"
        color={confirmed ? 'primary' : 'primary'}
        onClick={handleSavePreInterview}>
        {confirmed ? 'RÉALISÉ(S)' : 'CONFIRMER'}
      </Button>
    </div>
  );
};

export default PreInterviewComponent;
