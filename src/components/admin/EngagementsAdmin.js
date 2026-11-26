import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Box,
  Checkbox,
  Chip,
  FormControlLabel,
  FormGroup,
  Stack,
  Typography,
} from '@mui/material';
import {
  ENGAGEMENTS,
  OUTING_PERIODS,
  engagementLabel,
  engagementsOf,
} from '../../js/engagements';
import { notifyApplicationChanged } from '../../js/applicationProgress';

const BASE_URL = process.env.REACT_APP_BASE_URL;

// Volunteer's page (team): what he wishes, and the activities the team
// gives him (that is what counts: tutoring = pairs, culture = outings)
const EngagementsAdmin = ({ user, canEdit, onChanged }) => {
  const [assigned, setAssigned] = useState([]);
  useEffect(() => setAssigned(engagementsOf(user)), [user]);
  const wished = user.engagements_wished || [];
  const periods = (user.outing_periods || [])
    .map((p) => OUTING_PERIODS.find((x) => x.value === p)?.label)
    .filter(Boolean);

  const change = async (value) => {
    const list = assigned.includes(value)
      ? assigned.filter((x) => x !== value)
      : [...assigned, value];
    if (!list.length) {
      toast.error('Gardez au moins une activité', { position: 'bottom-left' });
      return;
    }
    const before = assigned;
    setAssigned(list);
    try {
      await axios.patch(`${BASE_URL}/admin/users/${user.id}/engagements`, {
        engagements: list,
      });
      notifyApplicationChanged();
      onChanged?.();
    } catch (err) {
      setAssigned(before);
      toast.error(
        err.response?.data?.error || "Les activités n'ont pas pu être changées",
        { position: 'bottom-left' }
      );
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stack
        direction="row"
        spacing={0.5}
        alignItems="center"
        flexWrap="wrap"
        useFlexGap>
        <Typography variant="body2" color="text.secondary">
          Souhaite :
        </Typography>
        {wished.length ? (
          wished.map((w) => (
            <Chip
              key={w}
              size="small"
              variant="outlined"
              label={engagementLabel(w)}
            />
          ))
        ) : (
          <Typography variant="body2">—</Typography>
        )}
      </Stack>
      {periods.length > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Sorties : {periods.join(', ').toLowerCase()}
        </Typography>
      )}
      <Typography fontWeight={600} sx={{ mt: 1.5 }}>
        Activités confiées
      </Typography>
      <FormGroup>
        {ENGAGEMENTS.map((e) => (
          <FormControlLabel
            key={e.value}
            control={
              <Checkbox
                size="small"
                checked={assigned.includes(e.value)}
                disabled={!canEdit}
                onChange={() => change(e.value)}
              />
            }
            label={<Typography variant="body2">{e.label}</Typography>}
          />
        ))}
      </FormGroup>
      <Typography variant="caption" color="text.secondary">
        Sans tutorat : pas de binôme, pas de convention ; B3 demandé avant la
        validation.
      </Typography>
    </Box>
  );
};

export default EngagementsAdmin;
