import React, { useEffect, useState } from 'react';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Button from '@mui/material/Button';

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

  const handleReceivedChange = async () => {
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
    <FormControl component="fieldset">
      {/* <FormLabel component="legend">Documents vérifiés</FormLabel> */}
      <FormGroup aria-label="position" row>
        <FormControlLabel
          control={
            <Checkbox
              checked={cvReceived}
              onChange={handleCvReceived}
              inputProps={{ 'aria-label': 'controlled' }}
              color="primary"
            />
          }
          label="cv"
          labelPlacement="top"
          value="true"
        />
        <FormControlLabel
          value={user.id_received}
          control={
            <Checkbox
              checked={idReceived}
              onChange={handleIdReceived}
              inputProps={{ 'aria-label': 'controlled' }}
              color="secondary"
            />
          }
          label="id"
          labelPlacement="top"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={b3Received}
              onChange={handleB3Received}
              inputProps={{ 'aria-label': 'controlled' }}
              color="warning"
            />
          }
          label="b3"
          labelPlacement="top"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={testVoltairePassed}
              onChange={handleTestVoltaire}
              inputProps={{ 'aria-label': 'controlled' }}
              color="success"
            />
          }
          label="Voltaire"
          labelPlacement="top"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={conventionReceived}
              onChange={handleConventionReceived}
              inputProps={{ 'aria-label': 'controlled' }}
              color="info"
            />
          }
          label="Convention"
          labelPlacement="top"
        />
        <FormControlLabel
          control={<Button onClick={handleReceivedChange}>SAVE</Button>}
          label=""
          labelPlacement="top"
        />
      </FormGroup>
    </FormControl>
  );
};

export default DocumentCheckbox;
