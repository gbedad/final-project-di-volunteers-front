import React, { useState, useEffect } from 'react';

import { Container } from '@mui/material';

import './HomePage.css';

const containerStyle = {
  position: 'relative',
  width: '100%',

  display: 'flex',
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
    <Container style={containerStyle}>
      <div className={`background background-${screenSize}`}>
        {/* Add content for each screen size */}
        <div className="content">{/* Your content goes here */}</div>
      </div>
    </Container>
  );
};

export default HomePage;
