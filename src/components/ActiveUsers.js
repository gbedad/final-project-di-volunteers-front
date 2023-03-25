import * as React from 'react';

import Typography from '@mui/material/Typography';
import Title from './Title';


export default function ActiveUsers(props) {

    const activeUsers = props.data
  return (
    <React.Fragment>
      <Title>Active Users</Title>
      <Typography component="p" variant="h4">
        {activeUsers}
      </Typography>
      {/* <Typography color="text.secondary" sx={{ flex: 1 }}>
        Users already active with participants
      </Typography> */}
    </React.Fragment>
  );
}