import React, { useEffect, useState } from 'react';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import BorderedBoxWithLabel from '../borderedBox';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const DocumentCheckbox = ({ user }) => {
  const [cvReceived, setCvReceived] = useState(false);
  const [idReceived, setIdReceived] = useState(false);
  const [b3Received, setB3Received] = useState(false);
  const [conventionReceived, setConventionReceived] = useState(false);
  const [testVoltairePassed, setTestVoltairePassed] = useState(false);

  const handleCvReceived = (event) => {
    setCvReceived(event.target.checked);
  };
  const handleIdReceived = (event) => {
    setIdReceived(event.target.checked);
  };
  const handleB3Received = (event) => {
    setB3Received(event.target.checked);
  };

  const handleConventionReceived = (event) => {
    setConventionReceived(event.target.checked);
  };
  const handleTestVoltaire = (event) => {
    setTestVoltairePassed(event.target.checked);
  };

  const handleReceivedChange = async (event) => {
    try {
      await fetch(`${BASE_URL}/update-files-received/${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          cvReceived,
          idReceived,
          b3Received,
          conventionReceived,
          testVoltairePassed,
        }),
      });
      console.log(`Document status updated for "${user.id}"`);
    } catch (error) {
      console.error('Error updating document status:', error);
    }
  };
  useEffect(() => {
    setCvReceived(user.cv_received);
    setIdReceived(user.id_received);
    setB3Received(user.b3_received);
    setConventionReceived(user.convention_received);
    setTestVoltairePassed(user.test_voltaire_passed);
  }, []);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={1}>
        <Grid item xs={8}>
          <FormControl component="fieldset">
            <FormGroup aria-label="position" row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={cvReceived || false}
                    onChange={handleCvReceived}
                    inputProps={{ 'aria-label': 'controlled' }}
                    color="primary"
                  />
                }
                label="CV"
                labelPlacement="right"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={idReceived || false}
                    onChange={handleIdReceived}
                    inputProps={{ 'aria-label': 'controlled' }}
                    color="primary"
                  />
                }
                label="ID"
                labelPlacement="right"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={b3Received || false}
                    onChange={handleB3Received}
                    inputProps={{ 'aria-label': 'controlled' }}
                    color="primary"
                  />
                }
                label="B3"
                labelPlacement="right"
              />
            </FormGroup>
            <FormGroup aria-label="position" row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={testVoltairePassed || false}
                    onChange={handleTestVoltaire}
                    inputProps={{ 'aria-label': 'controlled' }}
                    color="primary"
                  />
                }
                label="Test de français *"
                labelPlacement="right"
              />
            </FormGroup>
            <FormGroup row aria-label="position">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={conventionReceived || false}
                    onChange={handleConventionReceived}
                    inputProps={{ 'aria-label': 'controlled' }}
                    color="primary"
                  />
                }
                label="Convention"
                labelPlacement="right"
              />
            </FormGroup>
            <Grid item xs={4}>
              <FormControlLabel
                control={
                  <Button onClick={handleReceivedChange}>CONFIRMER</Button>
                }
                label=""
                labelPlacement="top"
              />
            </Grid>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DocumentCheckbox;
