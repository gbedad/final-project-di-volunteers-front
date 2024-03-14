import React from 'react';
import { useLocation } from 'react-router-dom';
import { MissionsProvider } from './MissionsContext';

import { Typography, Container } from '@mui/material';

import CardList from './MissionsCardsList';
import MissionForm from './MissionForm2';

const MissionPage = () => {
  const location = useLocation();
  const user = location.state.userLogged;

  return (
    <MissionsProvider>
      <Container maxWidth="xl" mt={4}>
        <Typography variant="h6">Liste des missions</Typography>
        <MissionForm userLogged={user} />
        <CardList userLogged={user} />
      </Container>
    </MissionsProvider>
  );
};

export default MissionPage;
