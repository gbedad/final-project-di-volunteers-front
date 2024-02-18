import * as React from 'react';
import Alert from '@mui/material/Alert';

export default function FilledAlerts({ props }) {
  const { severity, message } = props;
  return (
    <Alert variant="outlined" severity={severity}>
      {message}
    </Alert>
  );
}
