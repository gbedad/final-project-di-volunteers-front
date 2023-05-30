import React from 'react';
import { Box } from '@mui/system';
import { Typography } from '@mui/material';
import parcours from '../assets/parcours-benevole.png';

const ImageDisplay = () => {
  return (
    <Box sx={{ textAlign: 'center' }}>
      <img src={parcours} alt="Parcours" style={{ width: '100%' }} />
      <Typography variant="caption"></Typography>
    </Box>
  );
};

export default ImageDisplay;
