import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { contactByEmail, volunteerEmail } from '../js/email';

// Write to a volunteer in Gmail (new tab, prefilled message)
const EmailButton = ({ volunteer, size = 'medium' }) => {
  if (!volunteerEmail(volunteer)) return null;
  return (
    <Tooltip title={`Écrire à ${volunteer.first_name} dans Gmail`}>
      <IconButton
        size={size}
        color="primary"
        onClick={(event) => {
          // Don't open the row when used inside the dashboard table
          event.stopPropagation();
          contactByEmail(volunteer);
        }}>
        <MailOutlineIcon fontSize={size === 'small' ? 'small' : 'medium'} />
      </IconButton>
    </Tooltip>
  );
};

export default EmailButton;
