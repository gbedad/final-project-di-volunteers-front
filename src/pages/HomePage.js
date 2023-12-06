import React from 'react';
import CardList from '../components/cards/Cards';
import { Typography, Container, Grid } from '@mui/material';

import siteimage from '../assets/neuropedagogie.png';
import style_apprentissage_image from '../assets/styles-dapprentissage.png';

const HomePage = () => {
  return (
    <Container>
      <Grid container spacing={2} alignItems="center" mt={3}>
        <Grid item xs={12} md={8} lg={8}>
          <img
            src={siteimage}
            alt="Description of the site"
            style={{ width: '100%', height: 'auto' }}
          />
        </Grid>
        <Grid item xs={12} md={4} lg={4}>
          <Typography variant="h4" gutterBottom color="secondary.main">
            Bienvenue à l'association Séphora Berrebi !
          </Typography>
          <Typography variant="body1" paragraph color="primary.main">
            L'association Séphora Berrebi accompagne les enfants et adolescents
            «empêchés» dans leurs apprentissages pour diverses raisons
            (médicales, socio-culturelles, financières, linguistiques,
            cognitives, médicales). Pour les aider, elle cherche des bénévoles
            bienveillants, engagés, passionnés par la transmission et
            l’éducation.
          </Typography>
        </Grid>
        <Grid item xs={12} md={8} lg={8}>
          <img
            src={style_apprentissage_image}
            alt="Description of the site"
            style={{ width: '100%', height: 'auto' }}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage;
