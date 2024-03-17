import React from 'react';
import { useLocation } from 'react-router-dom';
import { MissionsProvider } from './MissionsContext';

import { Typography, Container } from '@mui/material';

import CardList from './MissionsCardsList';
import MissionForm from './MissionForm2';
import Error404 from '../../pages/404';

const MissionPage = () => {
  const location = useLocation();
  const connected = location.state;
  let user;
  if (connected) {
    user = connected.userLogged;
  }

  return !connected ? (
    <Error404 />
  ) : (
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
