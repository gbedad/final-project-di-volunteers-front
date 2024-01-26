import React from 'react';
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
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
};

const imageStyle = {
  position: 'relative',
  top: 100,
  left: 0,
  width: '80vw',
  height: 'auto',
};

const HomePage = () => {
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  const isMediumScreen = useMediaQuery(
    '(min-width:601px) and (max-width:960px)'
  );
  return (
    <Box
      style={containerStyle}
      sx={{
        backgroundImage: {
          xs: 'url("../assets/mycogniverse_sm.png")',
          md: 'url("../assets/mycogniverse_md.png")',
          lg: `url(${'../assets/mycogniverse.png'})`,
        },
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'contain', //like obect-fit
      }}>
      {/* <img src={ImageUrl_lg} alt="Tutoring" style={imageStyle} /> */}
    </Box>
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
