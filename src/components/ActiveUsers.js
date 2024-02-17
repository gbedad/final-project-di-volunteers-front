import * as React from 'react';

import Typography from '@mui/material/Typography';
import Title from './Title';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';

export default function ActiveUsers(props) {
  const activeUsers = props.data;
  return (
    <>
      <Grid container spacing={2} sx={{ m: 0.5 }}>
        <Grid item xs={12}>
          <Title>Tuteurs actifs</Title>
          {props.data ? (
            <Typography component="p" variant="h4">
              {activeUsers}
            </Typography>
          ) : (
            <Typography>
              <CircularProgress />
            </Typography>
          )}

          {/* <Typography color="text.secondary" sx={{ flex: 1 }}>
        Users already active with participants
      </Typography> */}
        </Grid>
      </Grid>
    </>
  );
}
