import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Box,
  Checkbox,
  Chip,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  ENGAGEMENTS,
  OUTING_PERIODS,
  engagementLabel,
} from '../../js/engagements';
import { notifyApplicationChanged } from '../../js/applicationProgress';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const toggle = (list, v) =>
  list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

// Ticks of the activities (registration form, volunteer's space)
export const EngagementChoices = ({ value, onChange, error }) => (
  <Box>
    <FormGroup>
      {ENGAGEMENTS.map((e) => (
        <FormControlLabel
          key={e.value}
          control={
            <Checkbox
              checked={value.includes(e.value)}
              onChange={() => onChange(toggle(value, e.value))}
            />
          }
          label={
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {e.label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {e.hint}
              </Typography>
            </Box>
          }
          sx={{
            alignItems: 'flex-start',
            mb: 0.5,
            '& .MuiCheckbox-root': { pt: 0.5 },
          }}
        />
      ))}
    </FormGroup>
    {error && <FormHelperText error>{error}</FormHelperText>}
  </Box>
);

// "Mes disponibilités": the activities wished (and, for the outings, when
// one is rather free); saved at each tick. The team decides in the end.
const Engagements = ({ userId, user, onSaved }) => {
  const [wished, setWished] = useState(null);
  const [periods, setPeriods] = useState([]);
  useEffect(() => {
    if (!user) return;
    setWished(
      user.engagements_wished?.length ? user.engagements_wished : ['tutorat']
    );
    setPeriods(user.outing_periods || []);
  }, [user]);

  const save = async (body) => {
    try {
      await axios.patch(`${BASE_URL}/users/${userId}/engagements`, body);
      notifyApplicationChanged();
      onSaved?.();
    } catch (err) {
      toast.error(
        err.response?.data?.error || "L'enregistrement n'a pas pu se faire",
        { position: 'bottom-left' }
      );
    }
  };
  if (!wished) return null;
  const outings = wished.some((w) => w !== 'tutorat');
  const assigned = user?.engagements;

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        Mes activités
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Cochez ce que vous souhaitez faire. L'association vous confirme ensuite
        vos activités.
      </Typography>
      <EngagementChoices
        value={wished}
        onChange={(list) => {
          if (!list.length) {
            toast.error('Gardez au moins une activité', {
              position: 'bottom-left',
            });
            return;
          }
          setWished(list);
          save({ engagements_wished: list });
        }}
      />
      {assigned?.length > 0 && (
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
          sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Confirmées par l'association :
          </Typography>
          {assigned.map((a) => (
            <Chip
              key={a}
              size="small"
              color="primary"
              label={engagementLabel(a)}
            />
          ))}
        </Stack>
      )}
      {outings && (
        <Box sx={{ mt: 2 }}>
          <Typography fontWeight={600}>
            Pour les sorties, je suis plutôt disponible
          </Typography>
          <FormGroup row>
            {OUTING_PERIODS.map((p) => (
              <FormControlLabel
                key={p.value}
                control={
                  <Checkbox
                    checked={periods.includes(p.value)}
                    onChange={() => {
                      const list = toggle(periods, p.value);
                      setPeriods(list);
                      save({ outing_periods: list });
                    }}
                  />
                }
                label={p.label}
              />
            ))}
          </FormGroup>
        </Box>
      )}
    </Paper>
  );
};

export default Engagements;
