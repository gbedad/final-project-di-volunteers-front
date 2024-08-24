import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, Button, Typography, Box, Container, Grid } from '@mui/material';

import { useAuth } from '../../../../AuthContext'; // Adjust this import path

const AdminLanding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  console.log(user);

  const dashboardItems = [
    {
      title: 'Tuteurs',
      description: 'Manage user accounts and permissions',
      path: '/admin/view-users',
    },
    {
      title: 'Elèves',
      description: 'Inscription des bénéficiaires',
      path: '/admin/student-grid',
    },
    {
      title: 'Gestion',
      description: 'Gestion des bénéficiaires',
      path: '/admin',
    },
    {
      title: 'Analytics',
      description: 'Analyze system performance',
      path: '/admin',
    },
  ];

  const handleNavigation = (path) => {
    navigate(path, { state: { userLogged: user } });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Grid container spacing={3}>
          {dashboardItems.map((item, index) => (
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
                  Go to {item.title}
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
