import React from 'react';
import {
  TextField,
  Box,
  Button,
  Divider,
  Typography,
  Grid,
  Select,
  MenuItem,
  Stack,
  Chip,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
} from '@mui/material';

function SchoolHistory() {
  return (
    <Grid spacig={2} pb={5}>
      <Grid item xs={12} spacing={2}>
        <FormControl
          sx={{
            minWidth: '100%',
            mt: 2,
            fontFamily: 'IBM Plex Sans, sans-serif',
            fontSize: '0.4rem',
            fontWeight: '400',
            lineHeight: '1.5',
          }}>
          <TextField
            id="outlined-multiline-static"
            label="Détail apprentissages"
            multiline
            minRows={4}
            placeholder=""
            InputLabelProps={{
              shrink: true,
            }}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} spacing={2}>
        <Stack direction="column" spacing={2} mb={2} mt={2}>
          <FormControl required sx={{ m: 1, minWdth: 300, width: 'auto' }}>
            <InputLabel shrink id="demo-simple-select-standard-label">
              Maladie grave ou chronique
            </InputLabel>

            <Select
              size="small"
              notched
              fullWidth
              labelId="demo-simple-select-standard-label"
              id="demo-simple-select-standard"
              label="Maladie grave ou chronique">
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value={'oui'}>Oui</MenuItem>
              <MenuItem value={'non'}>Non</MenuItem>
              <MenuItem value={'NSP'}>NSP</MenuItem>
            </Select>
          </FormControl>

          <FormControl required sx={{ m: 1, minWdth: 300, width: 'auto' }}>
            <InputLabel shrink id="demo-simple-select-standard-label">
              Trouble apprentissage
            </InputLabel>

            <Select
              size="small"
              notched
              fullWidth
              labelId="demo-simple-select-standard-label"
              id="demo-simple-select-standard"
              label="Trouble apprentissage">
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value={'oui'}>Oui</MenuItem>
              <MenuItem value={'non'}>Non</MenuItem>
              <MenuItem value={'NSP'}>NSP</MenuItem>
            </Select>
          </FormControl>
          <Stack spacing={1} direction={'row'}>
            <FormControl required sx={{ m: 1, width: 450 }}>
              <InputLabel shrink id="demo-simple-select-standard-label">
                Suivi orthophonique
              </InputLabel>

              <Select
                size="small"
                notched
                autoWidth
                labelId="demo-simple-select-standard-label"
                id="demo-simple-select-standard"
                label="Suivi orthophonique">
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value={'NSP'}>NSP</MenuItem>
                <MenuItem value={'oui, terminé'}>Oui, terminé</MenuItem>
                <MenuItem value={'oui, depuis'}>Oui, depuis</MenuItem>
              </Select>
            </FormControl>
            <TextField
              size="small"
              fullWidth
              label="Depuis le"
              margin="normal"
              type="date"
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </Stack>
      </Grid>
    </Grid>
  );
}

export default SchoolHistory;
