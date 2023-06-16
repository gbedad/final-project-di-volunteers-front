import React from 'react';
import { MissionsProvider } from './MissionsContext';
import MissionForm from './MissionForm2';
import MissionList from './MissionsList2';
import BorderedBoxWithLabel from '../borderedBox';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Container,
} from '@mui/material';

import CardList from './MissionsCardsList';

const MissionPage = () => {
  return (
    <MissionsProvider>
      <Container maxWidth="xl" mt={4}>
        {/* <Grid container spacing={2}>
          <Grid item xs={12} sm={12} md={12} lg={12}> */}
        <Typography variant="h6">Liste des missions</Typography>
        <CardList />
        {/* </Grid>
        </Grid> */}
      </Container>
    </MissionsProvider>
  );
};

export default MissionPage;
