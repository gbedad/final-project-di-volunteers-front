import React from 'react';
import CardList from '../components/cards/Cards';
import { Typography, Container, Grid } from '@mui/material';

import siteimage from '../assets/tutoring_homework_3409142.png';

const HomePage = () => {
  return (
    <Container>
      <Grid container spacing={2} alignItems="center" mt={3}>
        <Grid item xs={12} md={6}>
          <img
            src={siteimage}
            alt="Description of the site"
            style={{ width: '100%', height: 'auto' }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom>
            Bienvenue à l'association Séphora Berrebi !
          </Typography>
          <Typography variant="body1" paragraph>
            L'association Séphora Berrebi accompagne les enfants et adolescents
            «empêchés» dans leurs apprentissages pour diverses raisons
            (médicales, socio-culturelles, financières, linguistiques,
            cognitives, médicales). Pour les aider, elle cherche des bénévoles
            bienveillants, engagés, passionnés par la transmission et
            l’éducation.
          </Typography>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage;
