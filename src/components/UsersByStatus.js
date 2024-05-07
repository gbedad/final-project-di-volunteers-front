import * as React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Title from './Title';

export default function UsersByStatusGrid(props) {
  // console.log(props.data);
  const allStatus = props.data;
  return (
    <>
      <Grid container spacing={1} sx={{ m: 0.5 }}>
        <Grid item xs={2}>
          <Title>Compte créé</Title>
          <Typography component="p" variant="h4">
            {allStatus['Compte créé'] ? allStatus['Compte créé'] : 0}
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <Title>A renseigner</Title>
          <Typography component="p" variant="h4">
            {allStatus['A renseigner'] ? allStatus['A renseigner'] : 0}
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <Title>A télécharger</Title>
          <Typography component="p" variant="h4">
            {allStatus['A télécharger'] ? allStatus['A télécharger'] : 0}
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <Title>A interviewer</Title>
          <Typography component="p" variant="h4">
            {allStatus['A interviewer'] ? allStatus['A interviewer'] : 0}
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <Title>A finaliser</Title>
          <Typography component="p" variant="h4">
            {allStatus['A finaliser'] ? allStatus['A finaliser'] : 0}
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <Title>Validé</Title>
          <Typography component="p" variant="h4">
            {allStatus['Validé'] ? allStatus['Validé'] : 0}
          </Typography>
        </Grid>
        {/* <Grid item xs={1}>
          <Title>Décliné</Title>
          <Typography component="p" variant="h4">
            {allStatus['Décliné'] ? allStatus['Décliné'] : 0}
          </Typography>
        </Grid> */}
      </Grid>
    </>
  );
}
