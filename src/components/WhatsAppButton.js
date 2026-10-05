import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { contactOnWhatsApp, whatsappNumber } from '../js/whatsapp';

// Contact a volunteer on WhatsApp; hidden when the phone number is unusable
const WhatsAppButton = ({ volunteer, size = 'medium' }) => {
  if (!volunteer || !whatsappNumber(volunteer.phone)) return null;
  return (
    <Tooltip title={`Contacter ${volunteer.first_name} sur WhatsApp`}>
      <IconButton
        size={size}
        sx={{ color: '#25D366' }}
        onClick={(event) => {
          // Don't open the row when used inside the dashboard table
          event.stopPropagation();
          contactOnWhatsApp(volunteer);
        }}>
        <WhatsAppIcon fontSize={size === 'small' ? 'small' : 'medium'} />
      </IconButton>
    </Tooltip>
  );
};

export default WhatsAppButton;
