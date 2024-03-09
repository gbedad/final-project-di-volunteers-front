import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export default function FloatingActionButton() {
  let navigate = useNavigate();
  const routeChange = () => {
    let path = '/register';
    navigate(path);
  };

  return (
    <Box sx={{ position: 'fixed', top: '130px', right: '20px' }}>
      <Fab
        variant="extended"
        size="medium"
        color="primary"
        onClick={routeChange}>
        <AccountCircleIcon sx={{ mr: 1 }} />
        Créer un compte
      </Fab>
    </Box>
  );
}
