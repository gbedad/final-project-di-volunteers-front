import React from 'react';
import { MissionsProvider } from './MissionsContext';
import MissionForm from './MissionForm2';
import MissionList from './MissionsList2';
import BorderedBoxWithLabel from '../borderedBox';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';

import CardList from './MissionsCardsList';

const MissionPage = () => {
  return (
    <MissionsProvider>
      <Box
        mt={4}
        sx={{
          alignContent: 'center',
        }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12} md={6} lg={3}>
            <BorderedBoxWithLabel
              label="Créer une mission"
              sx={{ display: 'flex', flexDirection: 'row' }}>
              <MissionForm />
            </BorderedBoxWithLabel>
          </Grid>
          <Grid item xs={12} sm={12} md={6} lg={9}>
            <BorderedBoxWithLabel
              label="Liste des missions"
              sx={{ display: 'flex' }}>
              {/* <MissionList /> */}
              <CardList />
            </BorderedBoxWithLabel>
          </Grid>
        </Grid>
      </Box>
    </MissionsProvider>
  );
};

export default MissionPage;
