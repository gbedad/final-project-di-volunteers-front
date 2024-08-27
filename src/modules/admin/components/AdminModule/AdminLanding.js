import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, Button, Typography, Box, Container, Grid } from '@mui/material';

import { useAuth } from '../../../../AuthContext'; // Adjust this import path

const AdminLanding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  console.log(user);

  const dashboardItems_tutors = [
    {
      title: 'TUTEURS',
      description:
        "Module de recrutement des tuteurs depuis leur candidature jusq'à leur validation.",
      path: '/admin/view-users',
    },
  ];

  const dashboardItems_students = [
    {
      title: 'INSCRIPTIONS ELEVES',
      description:
        "Module de saisie par l'administareur des informations requises la recherche d'un tuteur.",
      path: '/admin/student-grid',
    },
    {
      title: 'SUIVI ADMINISTRATIF ELEVES',
      description:
        "Module de saisie par l'admisnistrateur des informations requises pour la signature de la convention et suivi des règlements.",
      path: '/admin',
    },
    {
      title: 'SUIVI PEDAGOGIQUE ELEVES',
      description:
        'Module de saisie du détail des cours mis en place, des comptes-rendus des entretiens trimestriels et des bilans annuel.',
      path: '/admin',
    },
  ];

  const handleNavigation = (path) => {
    navigate(path, { state: { userLogged: user } });
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          MODULES ADMIN
        </Typography>
        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          {dashboardItems_tutors.map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {item.title}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, flexGrow: 1 }}>
                  {item.description}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleNavigation(item.path)}
                  fullWidth>
                  Aller au module
                </Button>
              </Paper>
            </Grid>
          ))}

          {dashboardItems_students.map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {item.title}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, flexGrow: 1 }}>
                  {item.description}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleNavigation(item.path)}
                  fullWidth>
                  Aller au module
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default AdminLanding;
