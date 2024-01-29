import React, { useState, useEffect } from 'react';

import { Container, Link, Typography } from '@mui/material';

import './HomePage.css';

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://mycogniverse.org/">
        Association Séphora Berrebi by Gerald Berrebi
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const containerStyle = {
  position: 'relative',
  width: '100%',

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
};

const HomePage = () => {
  const [screenSize, setScreenSize] = useState('');

  // Update screen size on mount and on window resize
  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 600) {
        setScreenSize('sm');
      } else if (width < 960) {
        setScreenSize('md');
      } else {
        setScreenSize('lg');
      }
    };

    updateScreenSize(); // Initial call
    window.addEventListener('resize', updateScreenSize);

    return () => {
      window.removeEventListener('resize', updateScreenSize);
    };
  }, []);
  return (
    <>
      <Container style={containerStyle} component="main" maxWidth="lg">
        <div className={`background background-${screenSize}`}>
          {/* Add content for each screen size */}
          <div className="content">{/* Your content goes here */}</div>
        </div>
        <Copyright sx={{ mt: 5 }} />
      </Container>
    </>
  );
};

export default HomePage;
