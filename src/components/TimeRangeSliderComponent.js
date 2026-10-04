import React, { useEffect } from 'react';
import axios from 'axios';
import Slider from '@mui/material/Slider';

import { Typography, Box } from '@mui/material';
import BorderedBoxWithLabel from './borderedBox';
import { useAutoSave } from '../js/useAutoSave';
import SaveStatus from './application/SaveStatus';

function valuetext(value) {
  return `${value}heures`;
}

const TimeRangeSlider = ({ userSelected }) => {
  const userId = userSelected;
  const [value, setValue] = React.useState([1, 1]);
  const [saveState, scheduleSave] = useAutoSave(userId, 'availability', {
    delay: 300,
  });

  useEffect(() => {
    const getAvailability = async () => {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/user-by-id/${userId}`
      );
      const skills = response.data.skill;
      if (skills && skills.availability) {
        setValue([skills.availability.min, skills.availability.max]);
      }
    };

    getAvailability();
  }, [userId]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Saved when the handle is released, not on every move
  const handleChangeCommitted = (event, newValue) => {
    scheduleSave({ min: newValue[0], max: newValue[1] });
  };

  return (
    <>
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
            onChangeCommitted={handleChangeCommitted}
            valueLabelDisplay="on"
            getAriaValueText={valuetext}
          />
          <SaveStatus state={saveState} />
        </Box>
      </BorderedBoxWithLabel>
    </>
  );
};

export default TimeRangeSlider;
