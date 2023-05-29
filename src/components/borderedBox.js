import React from 'react';
import { Box, Typography } from '@mui/material';

const BorderedBoxWithLabel = ({ label, children }) => {
  return (
    <Box
      sx={{
        border: '1px solid #ccc',
        borderRadius: '4px',
        padding: '16px',
        position: 'relative',
        marginBottom: '16px',
      }}>
      <Typography
        variant="subtitle2"
        sx={{
          position: 'absolute',
          top: '-12px',
          left: '8px',
          background: '#fff',
          padding: '0 4px',
          color: '#777',
        }}>
        {label}
      </Typography>
      {children}
    </Box>
  );
};

export default BorderedBoxWithLabel;
