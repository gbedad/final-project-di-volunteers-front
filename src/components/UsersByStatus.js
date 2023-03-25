import * as React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Title from './Title';
import Container from '@mui/material/Container';



export default function UsersByStatusGrid(props) {
    console.log(props.data)
    const allStatus = props.data
  return (
    <>
    <Grid container spacing={2} sx={{m:0.5}} >
      <Grid xs={2}>
        <Title>Created</Title>
      <Typography component="p" variant="h4">
       {allStatus.created ? allStatus.created : 0}
      </Typography>

      </Grid>
      <Grid xs={2}>
        <Title>Proposed</Title>
      <Typography component="p" variant="h4">
        {allStatus.proposed ? allStatus.proposed : 0}
      </Typography>

      </Grid>
      <Grid xs={2}>
        <Title>Selected</Title>
      <Typography component="p" variant="h4">
       {allStatus.selected ? allStatus.selected : 0}
      </Typography>

      </Grid>
      <Grid xs={2}>
       <Title>Validated</Title>
      <Typography component="p" variant="h4">
        {allStatus.validated ? allStatus.validated: 0}
      </Typography>
      </Grid>
    </Grid>
    </>
  );
}