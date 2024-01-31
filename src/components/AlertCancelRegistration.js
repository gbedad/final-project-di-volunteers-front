import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';

export default function ActionAlerts(props) {
  const navigate = useNavigate();
  const location = useLocation();
  // console.log(location.state);
  return (
    <Container>
      <Stack sx={{ width: '100%' }} spacing={2}>
        <Alert
          onClose={() => {
            navigate('/');
          }}>
          {location.state.message}
        </Alert>
        <Alert
          action={
            <Button color="inherit" size="small">
              UNDO
            </Button>
          }>
          This is a success alert — check it out!
        </Alert>
      </Stack>
    </Container>
  );
}
