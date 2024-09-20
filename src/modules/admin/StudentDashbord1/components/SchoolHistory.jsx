import React, { useState, useEffect } from 'react';
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

function SchoolHistory({ studentId, user }) {
  const [schoolHistory, setSchoolHistory] = useState({
    datail: '',
    illness: '',
    trouble: '',
    ortophonic: '',
    since: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getHistory = async () => {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/students/${studentId}`
      );
      let historydata;
      try {
        if (
          !response.data.school_history ||
          Object.keys(response.data.school_history).length === 0 ||
          response.data.school_history === null
        ) {
          historydata = {
            datail: '',
            illness: '',
            trouble: '',
            ortophonic: '',
            since: '',
          };
        } else if (
          Object.keys(response.data.school_history) !== null ||
          Object.keys(response.data.school_history).length !== 0
        ) {
          historydata = response.data.school_history;
          // console.log(preInterviewdata);

          setSchoolHistory(JSON.parse(historydata));
          setIsLoading(false);
        } else {
          setIsLoading(false);
          return true;
        }
      } catch (error) {
        console.log(error);
      }
    };
    getHistory();
  }, [studentId]);

  const updateHistory = (field, value) => {
    setSchoolHistory((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleSaveSchoolHistory = async () => {
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_BASE_URL}/students-school-history/${studentId}`,
        { schoolHistory },
        {
          headers: {
            'Content-Type': 'application/json',
            // 'x-access-token': userToken,
          },
        }
      );

      // console.log(response.data);
      if (response.data.message === 'History saved successfully') {
        // const result = areAllKeysNonNullOrEmpty(response.data);
        // if (result) {
        //   setConfirmed(true);
        // }

        console.log('History saved successfully');
      } else {
        console.error('Failed to save history');
      }
    } catch (error) {
      console.error('Failed to save history', error);
    }
  };

  return (
    <>
      <Grid spacig={2} pb={5}>
        <Grid item xs={12} spacing={2}>
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
              label="Détail apprentissages"
              multiline
              minRows={4}
              placeholder=""
              value={schoolHistory.detail}
              onChange={(e) => updateHistory('detail', e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} spacing={2}>
          <Stack direction="column" spacing={2} mb={2} mt={2}>
            <FormControl required sx={{ m: 1, minWdth: 300, width: 'auto' }}>
              <InputLabel shrink id="demo-simple-select-standard-label">
                Maladie grave ou chronique
              </InputLabel>

              <Select
                size="small"
                notched
                fullWidth
                labelId="demo-simple-select-standard-label"
                id="demo-simple-select-standard"
                label="Maladie grave ou chronique"
                value={schoolHistory.illness}
                onChange={(e) => updateHistory('illness', e.target.value)}>
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value={'oui'}>Oui</MenuItem>
                <MenuItem value={'non'}>Non</MenuItem>
                <MenuItem value={'NSP'}>NSP</MenuItem>
              </Select>
            </FormControl>

            <FormControl required sx={{ m: 1, minWdth: 300, width: 'auto' }}>
              <InputLabel shrink id="demo-simple-select-standard-label">
                Trouble apprentissage
              </InputLabel>

              <Select
                size="small"
                notched
                fullWidth
                labelId="demo-simple-select-standard-label"
                id="demo-simple-select-standard"
                label="Trouble apprentissage"
                value={schoolHistory.trouble}
                onChange={(e) => updateHistory('trouble', e.target.value)}>
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value={'oui'}>Oui</MenuItem>
                <MenuItem value={'non'}>Non</MenuItem>
                <MenuItem value={'NSP'}>NSP</MenuItem>
              </Select>
            </FormControl>
            <Stack spacing={1} direction={'row'}>
              <FormControl required sx={{ m: 1, width: 450 }}>
                <InputLabel shrink id="demo-simple-select-standard-label">
                  Suivi orthophonique
                </InputLabel>

                <Select
                  size="small"
                  notched
                  autoWidth
                  labelId="demo-simple-select-standard-label"
                  id="demo-simple-select-standard"
                  label="Suivi orthophonique"
                  value={schoolHistory.ortophonic}
                  onChange={(e) => updateHistory('ortophonic', e.target.value)}>
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value={'NSP'}>NSP</MenuItem>
                  <MenuItem value={'oui, terminé'}>Oui, terminé</MenuItem>
                  <MenuItem value={'oui, depuis'}>Oui, depuis</MenuItem>
                </Select>
              </FormControl>
              <TextField
                size="small"
                fullWidth
                label="Depuis le"
                margin="normal"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={schoolHistory.since}
                onChange={(e) => updateHistory('since', e.target.value)}
              />
            </Stack>
          </Stack>
        </Grid>
      </Grid>
      <Button variant="contained" onClick={handleSaveSchoolHistory}>
        CONFIRMER
      </Button>
    </>
  );
}

export default SchoolHistory;
