import React, { useState, useEffect } from 'react';
import axios from 'axios';

import {
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Button,
} from '@mui/material';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const SelectFormActivity = (props) => {
  const [selectedOption, setSelectedOption] = useState('');
  const [showSubmit, setShowSubmit] = useState(false);
  const { userId, onHandleChangeActivity, editing, activity } = props;
  console.log(activity);
  const handleSelectChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedOption(selectedValue);

    if (selectedValue !== '') {
      setShowSubmit(true);
    } else {
      setShowSubmit(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/add-activity`, {
        userId,
        selectedActivity: selectedOption,
      });
      console.log(response.data.message);
      setShowSubmit(false);
      // Perform any desired actions after successful submission
    } catch (error) {
      console.error(error);
      // Handle any errors
    }
  };

  const getUserById = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/user-by-id/${userId}`);
      if (response.data) {
        setSelectedOption(response.data.activity);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUserById();
  }, []);

  return (
    <>
      <FormControl variant="standard" sx={{ m: 1 }} fullWidth>
        <InputLabel id="demo-simple-select-standard-label">Activité</InputLabel>
        <Select
          color="warning"
          disabled={!editing}
          labelId="demo-simple-select-standard-label"
          id="demo-simple-select-standard"
          value={activity}
          onChange={onHandleChangeActivity}>
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          <MenuItem value={'Indépendant(e)'}>Indépendant(e)</MenuItem>
          <MenuItem value={'Salarié(e)'}>Salarié(e)</MenuItem>
          <MenuItem value={'Etudiant(e)'}>Etudiant(e)</MenuItem>
          <MenuItem value={'Retraité(e)'}>Retraité(e)</MenuItem>
          <MenuItem value={'Sans activité'}>Sans activité</MenuItem>
        </Select>
        {showSubmit && <Button onClick={handleSubmit}>CONFIRMER</Button>}
      </FormControl>
    </>
  );
};

export default SelectFormActivity;
