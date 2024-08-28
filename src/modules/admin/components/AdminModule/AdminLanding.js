import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Button,
  Typography,
  Box,
  Container,
  Grid,
  Stack,
} from '@mui/material';

import { useAuth } from '../../../../AuthContext'; // Adjust this import path

import BorderedBoxWithLabel from '../../../../components/borderedBox';

const AdminLanding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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
      disabled: false,
    },
    {
      title: 'SUIVI ADMINISTRATIF ELEVES',
      description:
        "Module de saisie par l'admisnistrateur des informations requises pour la signature de la convention et suivi des règlements.",
      path: '/admin',
      disabled: true,
    },
    {
      title: 'SUIVI PEDAGOGIQUE ELEVES',
      description:
        'Module de saisie du détail des cours mis en place, des comptes-rendus des entretiens trimestriels et des bilans annuel.',
      path: '/admin',
      disabled: true,
    },
  ];

  const handleNavigation = (path) => {
    navigate(path, { state: { userLogged: user } });
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom mb={4}>
          MODULES ADMINISTRATEUR
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4} lg={3}>
            <BorderedBoxWithLabel
              label="Module tuteurs"
              sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                <Stack spacing={2}>
                  {dashboardItems_tutors.map((item, index) => (
                    <Paper
                      key={index}
                      elevation={0}
                      variant="outlined"
                      sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        minHeight: '200px',
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
                  ))}
                </Stack>
              </Box>
            </BorderedBoxWithLabel>
          </Grid>
          <Grid item xs={12} md={4} lg={3}>
            <BorderedBoxWithLabel
              label="Module élèves"
              sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                <Stack spacing={2}>
                  {dashboardItems_students.map((item, index) => (
                    <Paper
                      key={index}
                      elevation={0}
                      variant="outlined"
                      sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        minHeight: '200px',
                      }}>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2, flexGrow: 1 }}>
                        {item.description}
                      </Typography>
                      <Button
                        disabled={item.disabled}
                        variant="contained"
                        color="primary"
                        onClick={() => handleNavigation(item.path)}
                        fullWidth>
                        Aller au module
                      </Button>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            </BorderedBoxWithLabel>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AdminLanding;
