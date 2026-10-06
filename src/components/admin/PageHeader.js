import React from 'react';
import { Box, Typography } from '@mui/material';

// Title of the admin pages (same size and spacing everywhere), with an
// optional line of explanation and actions on the right
const PageHeader = ({ title, subtitle, actions }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      gap: 2,
      mb: 2,
    }}>
    <Box sx={{ flex: 1, minWidth: 240 }}>
      <Typography variant="h5" component="h1" gutterBottom={!subtitle}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Box>
    {actions}
  </Box>
);

export default PageHeader;
