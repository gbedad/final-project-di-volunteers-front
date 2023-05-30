import React, { useState, useCallback, useEffect } from 'react';
import {
  AddressAutofill,
  AddressMinimap,
  useConfirmAddress,
  config,
} from '@mapbox/search-js-react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionActions from '@mui/material/AccordionActions';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';

import Stack from '@mui/material/Stack';

const AddressAutocomplete = () => {
  const [value, setValue] = React.useState('');

  console.log(value);
  return (
    <div>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1c-content"
          id="panel1c-header">
          <Typography>Adresse</Typography>
        </AccordionSummary>
        <form>
          <AddressAutofill
            accessToken="pk.eyJ1IjoiZ2JlZGFkIiwiYSI6ImNsaTlyc3VzYTFicmgza2x1ODFndHc2eHoifQ.7FiDsQwHvL3qR-Bqdngb4g"
            popoverOptions={{
              placement: 'top-start',
              flip: true,
              offset: 5,
            }}>
            <TextField
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              color="secondary"
              label="Voie"
              placeholder="Commencer à indiquer le nom de votre voie..."
              name="address"
              autoComplete="address-line1"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              fullWidth
              required
            />
          </AddressAutofill>
          <Stack
            spacing={2}
            direction="row"
            sx={{ marginBottom: 4, marginTop: 4 }}>
            <TextField
              type="text"
              variant="outlined"
              color="secondary"
              label="Ville"
              name="city"
              autoComplete="address-level2"
            />
            <TextField
              type="text"
              variant="outlined"
              color="secondary"
              label="Code postal"
              name="postcode"
              autoComplete="postal-code"
            />
            <TextField
              type="text"
              variant="outlined"
              color="secondary"
              label="Pays"
              name="country"
              autoComplete="country-name"
            />
          </Stack>
          <Button
            sx={{ marginBottom: 4 }}
            variant="outlined"
            color="secondary"
            type="submit">
            CONFIRMER
          </Button>
        </form>
      </Accordion>
    </div>
  );
};

export default AddressAutocomplete;
