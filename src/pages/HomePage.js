import React, { useState, useEffect, lazy, Suspense } from 'react';

import { Box, Link, Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

import './HomePage.css';

import MyCogniverseImg from '../assets/mycogniverse.png';

const CardPresentation = lazy(() => import('./cardsPresentationHomepage'));

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://mycogniverse.org/">
        Association Séphora Berrebi by Gérald Berrebi
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

// const containerStyle = {
//   position: 'relative',
//   width: '100%',

//   display: 'flex',
//   flexDirection: 'column',
//   alignItems: 'center',
//   justifyContent: 'center',
//   color: 'white',
// };

const HomePage = () => {
  const [screenSize, setScreenSize] = useState('');

  // Update screen size on mount and on window resize
  // useEffect(() => {
  //   const updateScreenSize = () => {
  //     const width = window.innerWidth;
  //     if (width < 600) {
  //       setScreenSize('sm');
  //     } else if (width < 960) {
  //       setScreenSize('md');
  //     } else {
  //       setScreenSize('lg');
  //     }
  //   };

  //   updateScreenSize(); // Initial call
  //   window.addEventListener('resize', updateScreenSize);

  //   return () => {
  //     window.removeEventListener('resize', updateScreenSize);
  //   };
  // }, []);
  return (
    <>
      <div align="center">
        <Typography variant="h4" component="h3" color="primary.main" mt={6}>
          Rejoignez l'équipe de bénévoles de l'association Séphora Berrebi !
        </Typography>
        {/* <div className={`background background-${screenSize}`}>
          <div className="content">
            <Typography variant="h3" component="h3" color="primary">
              A vous de jouer : commencez par choisir une mission&nbsp;!
            </Typography>
          </div>
        </div> */}
        <Suspense
          fallback={
            <div>
              <Typography variant="h5">
                Chargement de la page en cours...
              </Typography>
              <Typography variant="h6">
                Pendant le chargement, vous pouvez en profiter pour aller sur
                les pages "COMMENT CA MARCHE" ou "MISSIONS BENEVOLES".
              </Typography>
              <CircularProgress />
            </div>
          }>
          <CardPresentation />
        </Suspense>
        <img src={MyCogniverseImg} alt="Logo MyCogniverse" width={'50%'} />

        <Box mt={-8} maxWidth={'50%'}>
          <Typography variant="h6" component="h5" color="primary.main" mt={6}>
            Pour nous aider à mieux vous connaître avant de vous proposer des
            élèves à accompagner.
          </Typography>
        </Box>
      </div>
      <Copyright sx={{ mt: 5 }} />
    </>
  );
};

export default HomePage;
