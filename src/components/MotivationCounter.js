import React from 'react';
import { Typography } from '@mui/material';

// Limits of the "why do you apply" text (also checked by the server)
export const MOTIVATION_MIN = 15;
export const MOTIVATION_MAX = 1000;

// "123 / 1000 caractères", with what is still needed under the minimum
const MotivationCounter = ({ value }) => {
  const length = (value || '').trim().length;
  const tooShort = length < MOTIVATION_MIN;
  return (
    <Typography
      variant="caption"
      component="div"
      sx={{ textAlign: 'right', mt: 0.5 }}
      color={
        length >= MOTIVATION_MAX
          ? 'error.main'
          : tooShort
          ? 'warning.dark'
          : 'text.secondary'
      }>
      {tooShort
        ? `Encore ${MOTIVATION_MIN - length} caractère${
            MOTIVATION_MIN - length > 1 ? 's' : ''
          } au minimum · `
        : ''}
      {length} / {MOTIVATION_MAX} caractères
    </Typography>
  );
};

export default MotivationCounter;
