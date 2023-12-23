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
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';

import CheckIcon from '@mui/icons-material/Check';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { styled } from '@mui/system';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateField } from '@mui/x-date-pickers/DateField';
import NativeSelect from '@mui/material/NativeSelect';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const blue = {
  100: '#DAECFF',
  200: '#b6daff',
  400: '#3399FF',
  500: '#007FFF',
  600: '#0072E5',
  900: '#003A75',
};

const grey = {
  50: '#f6f8fa',
  100: '#eaeef2',
  200: '#d0d7de',
  300: '#afb8c1',
  400: '#8c959f',
  500: '#6e7781',
  600: '#57606a',
  700: '#424a53',
  800: '#32383f',
  900: '#24292f',
};

const StyledTextarea = styled(TextareaAutosize)(
  ({ theme }) => `
   
    font-family: IBM Plex Sans, sans-serif;
    font-size: 0.875rem;
    font-weight: 400;
    line-height: 1.5;
    padding: 12px;
    border-radius: 5px 5px 0 5px;
    color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
    background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
    border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
    box-shadow: 0px 2px 2px ${
      theme.palette.mode === 'dark' ? grey[900] : grey[50]
    };
  
    &:hover {
      border-color: ${blue[400]};
    }
  
    &:focus {
      border-color: ${blue[400]};
      box-shadow: 0 0 0 3px ${
        theme.palette.mode === 'dark' ? blue[500] : blue[200]
      };
    }
  
    // firefox
    &:focus-visible {
      outline: 0;
    }
  `
);
function a11yProps(index) {
  return {
    id: `action-tab-${index}`,
    'aria-controls': `action-tabpanel-${index}`,
  };
}

const BASE_URL = process.env.REACT_APP_BASE_URL;

const PreInterviewComponent = ({ userId }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState('');

  const [content, setContent] = useState('');
  const [records, setRecords] = useState([]);
  const [date, setDate] = React.useState(dayjs(Date.now()));
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
      console.log(response.data);
      if (response.data.interviews) {
        const parsed_array = response.data.interviews.map((string) =>
          JSON.parse(string)
        );
        setInterviews(parsed_array);
        setIsLoading(false);
      }
      setIsLoading(false);
      if (response.data.interviews.length > 0) {
        setCountInterviews(response.data.interviews.length);
        setConfirmed(true);
      }
    };

    getInterviews();
  }, []);

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

  const handleContentChange = (value, index) => {
    const updatedInterviews = [...interviews];
    updatedInterviews[index].content = value;
    setInterviews(updatedInterviews);
  };

  const handleInterviewChange = (key, value, index) => {
    setInterviews((prevInterviews) => {
      const updatedInterviews = [...prevInterviews];
      updatedInterviews[index][key] = value;
      return updatedInterviews;
    });
  };

  function parseInterviews(data) {
    const parsedData = data.map((interview) => {
      const { title, date, content } = JSON.parse(interview);
      return {
        title,
        date,
        content,
        by: { userLogged },
      };
    });
    return parsedData;
  }

  console.log(interviews);

  const handleAddInterview = () => {
    let count = 1;
    if (interviews.length > 0) {
      count = interviews.length + 1;
    }
    console.log(count);
    const dateToday = new Date().toLocaleDateString();
    console.log(dateToday);

    setInterviews([
      ...interviews,
      {
        title: `Entretien ${count}`,
        date: '',
        motivation: '',

        content: '',
        by: userLogged,
      },
    ]);
    setConfirmed(false);
  };

  const handleSaveInterviews = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/add-interviews/${userId}`,
        { interviews },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': userToken,
          },
        }
      );
      console.log(response.data.message);
      if (response.data.message) {
        setConfirmed(true);
        console.log('Interview saved successfully');
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
            {/* <TextField
              size="small"
              label="Title"
              value={''}
              onChange={(e) => handleTitleChange(e.target.value)}
              width={'50%'}
              InputLabelProps={{
                shrink: true,
              }}
            /> */}

            <FormControl>
              <InputLabel id="demo-simple-select-helper-label"></InputLabel>
              <TextField
                required={true}
                size="small"
                label="Date de l'entretien"
                type="date"
                defaultValue={new Date().toISOString()}
                value={''}
                error={!isDateValid}
                helperText={!isDateValid && 'Please select a valid date.'}
                onChange={(e) => handleDateChange(e.target.value)}
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
                value={''}
                onChange={(e) =>
                  handleInterviewChange('recommendation', e.target.value)
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
              value={''}
              // onChange={(e) =>
              //   handleInterviewChange(e.target.value, index)
              // }
              onChange={(e) => handleInterviewChange('content', e.target.value)}
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
                value={''}
                onChange={(e) =>
                  handleInterviewChange('recommendation', e.target.value)
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
        startIcon={confirmed ? <CheckIcon /> : ''}
        variant="contained"
        color={confirmed ? 'primary' : 'primary'}
        onClick={handleSaveInterviews}>
        {confirmed ? 'RÉALISÉ(S)' : 'CONFIRMER'}
      </Button>
    </div>
  );
};

export default PreInterviewComponent;
