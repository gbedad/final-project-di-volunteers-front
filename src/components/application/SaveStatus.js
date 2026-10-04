import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Small "Enregistré ✓" indicator shown next to an auto-saved block
const SaveStatus = ({ state }) => {
  if (state === 'idle') return null;
  const content = {
    pending: [<CircularProgress key="p" size={12} />, 'Enregistrement…'],
    saving: [<CircularProgress key="s" size={12} />, 'Enregistrement…'],
    saved: [<CheckIcon key="ok" sx={{ fontSize: 16 }} />, 'Enregistré'],
    error: [
      <ErrorOutlineIcon key="e" sx={{ fontSize: 16 }} />,
      'Non enregistré, réessayez',
    ],
  }[state];
  return (
    <Box
      role="status"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        fontSize: '0.8rem',
        color:
          state === 'error'
            ? 'error.main'
            : state === 'saved'
              ? 'success.main'
              : 'text.secondary',
      }}>
      {content}
    </Box>
  );
};

export default SaveStatus;
