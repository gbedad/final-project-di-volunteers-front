import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Chip,
  Grid,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import BorderedBoxWithLabel from './borderedBox';

// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// import { AuthContext } from '../AuthContext';

import {
  existingLocations,
  existingModalities,
} from '../options/existingOptions';
import { useAutoSave } from '../js/useAutoSave';
import SaveStatus from './application/SaveStatus';

// Modalities that need at least one site ("Sur site ou à distance" can be
// done remotely: sites are optional)
const SITE_REQUIRED = ['Sur site', 'Hybride (alternance sur site et à distance)'];


// Real sites only: not the separator nor the modalities of the old list
const NOT_SITES = /^-+$|^a distance$|^présentiel ou distanciel$/i;
const SITES = existingLocations.filter((l) => !NOT_SITES.test(l));

const LocationsPossibleComponent = ({ userSelected }) => {
  const location = useLocation();
  const [locationsPossible, setLocationsPossible] = useState([]);
  const [selectedModality, setSelectedModality] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  // const token = useContext(AuthContext);
  //  const subjectClassesRanges = userLogged.user.skill.topics

  // const userId = location.state.userLogged.user.id;
  const userId =
    location.state.userLogged.user.id === userSelected
      ? location.state.userLogged.user.id
      : userSelected;
  // console.log('USERID', userId);

  useEffect(() => {
    const getLocations = async () => {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/user-by-id/${userId}`
      );
      // console.log(response.data.skill.where_location);
      const skills = response.data.skill;
      //   const parsed_array = response.data.skill.locations.map(string => JSON.parse(string));
      if (skills) {
        const places = (skills.where_location || []).filter(Boolean);
        setSelectedModality(skills.how_location || '');
        setLocationsPossible(places);
      }
      setIsLoading(false);
    };

    getLocations();
  }, [userId]);

  const [modalityState, saveModality] = useAutoSave(userId, 'how_location');
  const [placesState, savePlaces] = useAutoSave(userId, 'where_location');
  // One indicator for the whole block
  const states = [modalityState, placesState];
  const saveState = states.includes('error')
    ? 'error'
    : states.includes('saving') || states.includes('pending')
      ? 'saving'
      : states.includes('saved')
        ? 'saved'
        : 'idle';

  // Places are saved as soon as one is chosen; empty rows are ignored
  const persistPlaces = (places) => savePlaces(places.filter(Boolean));

  const handleModalityChange = (value) => {
    setSelectedModality(value);
    saveModality(value);
  };
  const hasSite = locationsPossible.some(Boolean);

  // One tap selects or removes a site; saved at once
  const toggleSite = (site) => {
    const next = locationsPossible.includes(site)
      ? locationsPossible.filter((x) => x !== site)
      : [...locationsPossible, site];
    setLocationsPossible(next);
    persistPlaces(next);
  };
  // Sites chosen in the old list but no longer offered stay visible
  const shown = [...SITES, ...locationsPossible.filter((x) => x && !SITES.includes(x))];

  return (
    <div>
      <BorderedBoxWithLabel label="Modalités et lieux *" sx={{ display: 'flex' }}>
        <Grid container spacing={1.5} style={{ marginTop: '8px' }}>
          <Grid item xs={12}>
            <TextField
              size="small"
              fullWidth
              variant="outlined"
              label="Modalités"
              select
              value={selectedModality}
              onChange={(e) => handleModalityChange(e.target.value)}>
              {existingModalities.map((modality, idx) => (
                <MenuItem key={idx} value={modality}>
                  {modality}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {selectedModality !== 'A distance' && (
            <>
              {selectedModality && (
                <Grid item xs={12}>
                  <Typography
                    variant="body2"
                    color={
                      SITE_REQUIRED.includes(selectedModality) && !hasSite
                        ? 'warning.dark'
                        : 'text.secondary'
                    }>
                    {SITE_REQUIRED.includes(selectedModality)
                      ? 'Touchez les sites où vous pouvez aller (au moins un).'
                      : 'Facultatif : touchez les sites où vous pouvez aussi aller.'}
                  </Typography>
                </Grid>
              )}

              {isLoading ? (
                <Grid item xs={12}>
                  <LinearProgress />
                </Grid>
              ) : (
                <Grid item xs={12}>
                  <Stack direction="row" flexWrap="wrap" useFlexGap gap={1}>
                    {shown.map((site) => {
                      const on = locationsPossible.includes(site);
                      return (
                        <Chip
                          key={site}
                          label={site}
                          color={on ? 'primary' : 'default'}
                          variant={on ? 'filled' : 'outlined'}
                          icon={on ? <CheckIcon /> : undefined}
                          onClick={() => toggleSite(site)}
                          aria-pressed={on}
                          sx={{ height: 36, fontSize: '0.9rem' }}
                        />
                      );
                    })}
                  </Stack>
                </Grid>
              )}
            </>
          )}
          <Grid item xs={12} sx={{ minHeight: 28 }}>
            <SaveStatus state={saveState} />
          </Grid>
        </Grid>
      </BorderedBoxWithLabel>
    </div>
  );
};

export default LocationsPossibleComponent;
