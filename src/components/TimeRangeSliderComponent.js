import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Slider from '@mui/material/Slider';

import { Typography, Button, Box } from '@mui/material';
import BorderedBoxWithLabel from './borderedBox';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function valuetext(value) {
  return `${value}heures`;
}

const TimeRangeSlider = ({ userSelected, userLogged }) => {
  const userId = userSelected;
  // console.log(userSelected);
  const [value, setValue] = React.useState([1, 1]);
  const [showButton, setShowButton] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getLocations = async () => {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/user-by-id/${userId}`
      );
      // console.log(response.data.skill.where_location);
      const skills = response.data.skill;
      //   const parsed_array = response.data.skill.locations.map(string => JSON.parse(string));
      if (skills && skills.availability) {
        setValue([skills.availability.min, skills.availability.max]);
        setIsLoading(false);
        setShowButton(false);
      }
      if (response.data.skill === null) setIsLoading(false);
    };

    getLocations();
  }, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    setShowButton(true);
    // console.log(newValue);
  };

  //   const handleChange = (values) => {
  //     setSelectedRange(values);
  //   };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/create-skill/${userId}`,
        { availability: { min: value[0], max: value[1] } },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': userLogged.token,
          },
        }
      );
      // console.log(value);
      if (response.data.message) {
        // console.log('Subject and class ranges saved successfully');
        toast.success(response.data.message, {
          position: 'top-center',
        });
        setShowButton(false);
      } else {
        console.error('Failed to save subjects');
        toast.error('Failed to save subjects', {
          position: 'top-center',
        });
      }
      // console.log('Response from server:', response.data);
    } catch (error) {
      console.error('Error sending request:', error);
      // Handle error appropriately, e.g., display an error message to the user
    }
  };

  return (
    <>
      <ToastContainer />
      <BorderedBoxWithLabel label="Disponibilité" sx={{ display: 'flex' }}>
        <Typography
          variant="body2"
          style={{ marginBottom: '10px' }}
          color="primary.main">
          Je suis prêt(e) à effectuer (heures hebdomadaires de tutorat)
        </Typography>
        <Box mt={4}>
          <Slider
            min={1}
            max={10}
            marks
            step={0.5}
            getAriaLabel={() => 'Heures de tutorat'}
            value={value}
            onChange={handleChange}
            valueLabelDisplay="on"
            getAriaValueText={valuetext}
          />
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!showButton}>
            Enregistrer
          </Button>
        </Box>
      </BorderedBoxWithLabel>
    </>
  );
};

export default TimeRangeSlider;
