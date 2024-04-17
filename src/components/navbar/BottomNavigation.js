import React, { useState } from 'react';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Box,
} from '@mui/material';
import { Home, Info, AccountCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Copyright from '../../pages/copyright';

const BottomNavWrapper = ({ children }) => {
  return <Box sx={{ marginTop: '90px' }}>{children}</Box>;
};

const BottomNav = () => {
  const [value, setValue] = useState(0);
  const navigate = useNavigate();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <BottomNavWrapper>
      <Paper
        // sx={{
        //   position: 'fixed',
        //   bottom: 0,
        //   left: 0,
        //   right: 0,
        // }}
        elevation={3}>
        <BottomNavigation value={value} onChange={handleChange} showLabels>
          <BottomNavigationAction
            label="Accueil"
            icon={<Home />}
            onClick={() => handleNavigation('/')}
          />
          <BottomNavigationAction
            label="Mentions légales"
            icon={<Info />}
            onClick={() => handleNavigation('/cgu')}
          />
          {/* <BottomNavigationAction
            label="Profile"
            icon={<AccountCircle />}
            onClick={() => handleNavigation('/profile')}
          />*/}
        </BottomNavigation>
        <Copyright sx={{ mt: 1, mb: 1 }} />
      </Paper>
    </BottomNavWrapper>
  );
};

export default BottomNav;
