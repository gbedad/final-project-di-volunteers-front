import React from 'react';
import { Switch, FormControlLabel } from '@mui/material';

function CallFeatureToggle({ isFeatureActive, handleToggle }) {
  return (
    <FormControlLabel
      control={
        <Switch
          checked={isFeatureActive}
          onChange={handleToggle}
          name="callFeatureToggle"
          color="primary"
        />
      }
      label="Entretien réalisé"
    />
  );
}

export default CallFeatureToggle;
