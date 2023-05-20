import * as React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Title from './Title';
import Container from '@mui/material/Container';

export default function UsersByStatusGrid(props) {
  console.log(props.data);
  const allStatus = props.data;
  return (
    <>
      <Grid container spacing={2} sx={{ m: 0.5 }}>
        <Grid xs={2}>
          <Title>Compte créé</Title>
          <Typography component="p" variant="h4">
            {allStatus['compte créé'] ? allStatus['compte créé'] : 0}
          </Typography>
        </Grid>
        <Grid xs={2}>
          <Title>A renseigner</Title>
          <Typography component="p" variant="h4">
            {allStatus['à renseigner'] ? allStatus['à renseigner'] : 0}
          </Typography>
        </Grid>
        <Grid xs={2}>
          <Title>A interviewer</Title>
          <Typography component="p" variant="h4">
            {allStatus['à interviewer'] ? allStatus['à interviewer'] : 0}
          </Typography>
        </Grid>
        <Grid xs={2}>
          <Title>A finaliser</Title>
          <Typography component="p" variant="h4">
            {allStatus['à finaliser'] ? allStatus['à finaliser'] : 0}
          </Typography>
        </Grid>
        <Grid xs={2}>
          <Title>Validé</Title>
          <Typography component="p" variant="h4">
            {allStatus['validé'] ? allStatus['validé'] : 0}
          </Typography>
        </Grid>
        <Grid xs={2}>
          <Title>Décliné</Title>
          <Typography component="p" variant="h4">
            {allStatus['décliné'] ? allStatus['décliné'] : 0}
          </Typography>
        </Grid>
      </Grid>
    </>
  );
}
