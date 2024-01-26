import React, { useState, useEffect } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import Hidden from '@mui/material/Hidden';
import CardList from '../components/cards/Cards';
import { Typography, Container, Grid, Box } from '@mui/material';

import siteimage from '../assets/neuropedagogie.png';
import style_apprentissage_image from '../assets/styles-dapprentissage.png';
import home_png from '../assets/home_image.png';
import HomeGif from '../assets/MyCogniverseHome.gif';
import ImageUrl_lg from '../assets/mycogniverse.png';
import ImageUrl_sm from '../assets/mycogniverse_sm.png';
import ImageUrl_md from '../assets/mycogniverse_md.png';

import './HomePage.css';

const imageURL = '../assets/MyCogniverseCentered.gif';

// const backgroundStyle = {
//   position: 'relative',
//   // width: '100%',
//   height: '100%',
//   backgroundImage: `url(${HomeGif})`,
//   backgroundPosition: 'center',
//   backgroundSize: 'cover',
//   backgroundRepeat: 'no-repeat',
// };

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
    // <Container sx={{ display: 'flex', justifyContent: 'center' }}>
    //   <img
    //     src={HomeGif}
    //     alt="Description of the site"
    //     style={{
    //       width: '100vw',
    //       height: 'auto',

    //       zIndex: -1,
    //     }}
    //   />

    // <Container>
    //   <Grid container spacing={2} alignItems="center" mt={3}>
    //     <Grid item xs={12} md={8} lg={8}>
    //       <img
    //         src={home_png}
    //         alt="Description of the site"
    //         style={{ width: '100%', height: 'auto' }}
    //       />
    //     </Grid>

    //     <Grid item xs={12} md={4} lg={4}>
    //       <Typography variant="h4" gutterBottom color="secondary.main">
    //         Bienvenue à l'association Séphora Berrebi !
    //       </Typography>
    //       <Typography variant="body1" paragraph color="primary.main">
    //         L'association Séphora Berrebi accompagne les enfants et
    //         adolescents «empêchés» dans leurs apprentissages pour diverses
    //         raisons (médicales, socio-culturelles, financières, linguistiques,
    //         cognitives, médicales). Pour les aider, elle cherche des bénévoles
    //         bienveillants, engagés, passionnés par la transmission et
    //         l’éducation.
    //       </Typography>
    //     </Grid>
    //     <Grid item xs={12} md={8} lg={8}>
    //       <img
    //         src={style_apprentissage_image}
    //         alt="Description of the site"
    //         style={{ width: '100%', height: 'auto' }}
    //       />
    //     </Grid>
    //   </Grid>
    // </Container>
    // </Container>*/}
  );
};

export default HomePage;
