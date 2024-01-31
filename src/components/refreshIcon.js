import React from 'react';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';

const RefreshButton = ({ getUser }) => {
  const handleRefresh = () => {
    // Call the getUser function when the button is clicked
    // console.log('Clicked');
    getUser();
  };

  return (
    <IconButton color="primary" onClick={handleRefresh}>
      <RefreshIcon />
    </IconButton>
  );
};

export default RefreshButton;
