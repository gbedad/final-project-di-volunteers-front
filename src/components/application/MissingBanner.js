import React from 'react';
import { Alert } from '@mui/material';
import { joinFrench } from '../../js/applicationProgress';

// Top of a tab: what the volunteer still has to fill in on this tab
const MissingBanner = ({ items, done }) => {
  if (!items) return null;
  return items.length > 0 ? (
    <Alert severity="warning" sx={{ maxWidth: 900, mx: 'auto', mb: 2 }}>
      Il vous reste à indiquer : <b>{joinFrench(items)}</b>.
    </Alert>
  ) : (
    <Alert severity="success" sx={{ maxWidth: 900, mx: 'auto', mb: 2 }}>
      {done}
    </Alert>
  );
};

export default MissingBanner;
