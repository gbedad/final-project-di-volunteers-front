import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Box,
  Checkbox,
  Chip,
  FormControlLabel,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const formatDate = (v) => (v ? new Date(v).toLocaleDateString('fr-FR') : '');
const today = () => new Date().toISOString().slice(0, 10);
const inDays = (n) =>
  new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

// Can the tutor take a new student now? (computed by the server)
export const availabilityInfo = (a) => {
  if (!a) return null;
  switch (a.state) {
    case 'available':
      return {
        label: `${a.free} place${a.free > 1 ? 's' : ''}`,
        color: 'success',
        title: `Disponible : ${a.free} place(s) libre(s) sur ${a.total}`,
      };
    case 'full':
      return {
        label: 'Complet',
        color: 'default',
        title: `Suit déjà ${a.used} élève(s) sur ${a.total}`,
      };
    case 'incomplete':
      return {
        label: 'Profil incomplet',
        color: 'default',
        title: `À renseigner dans « Mes disponibilités » : ${(a.missing || []).join(', ')}`,
      };
    case 'paused':
      return {
        label: `Indisponible jusqu'au ${formatDate(a.until)}`,
        color: 'warning',
        title: 'Pas disponible pour un nouvel élève jusqu’à cette date',
      };
    default:
      return null;
  }
};

export const AvailabilityChip = ({ availability }) => {
  const info = availabilityInfo(availability);
  if (!info) return null;
  return (
    <Tooltip title={info.title}>
      <Chip
        size="small"
        color={info.color}
        variant={info.color === 'success' ? 'filled' : 'outlined'}
        icon={
          availability.state === 'paused' ? (
            <PauseCircleIcon />
          ) : availability.state === 'available' ? (
            <EventAvailableIcon />
          ) : undefined
        }
        label={info.label}
      />
    </Tooltip>
  );
};

// "Not available for a new student until …": set by the tutor or the team
export const UnavailableControl = ({ userId, value, onChange, self }) => {
  const [until, setUntil] = useState(value || '');
  const save = async (next) => {
    try {
      await axios.patch(`${BASE_URL}/users/${userId}/unavailable`, {
        until: next || null,
      });
      onChange?.(next || null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Enregistrement impossible', {
        position: 'bottom-left',
      });
    }
  };
  const checked = !!until;
  return (
    <Stack spacing={1}>
      <FormControlLabel
        control={
          <Checkbox
            checked={checked}
            onChange={(e) => {
              const next = e.target.checked ? inDays(30) : '';
              setUntil(next);
              save(next);
            }}
          />
        }
        label={
          self
            ? 'Je ne suis pas disponible pour un nouvel élève'
            : 'Pas disponible pour un nouvel élève'
        }
      />
      {checked && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ pl: 4 }}>
          <Typography variant="body2">jusqu'au</Typography>
          <TextField
            size="small"
            type="date"
            inputProps={{ min: today() }}
            value={until}
            onChange={(e) => {
              setUntil(e.target.value);
              if (e.target.value) save(e.target.value);
            }}
          />
        </Stack>
      )}
      <Typography variant="caption" color="text.secondary" sx={{ pl: 4 }}>
        {self
          ? "Pendant cette période, l'association ne vous proposera pas de nouvel élève. Vos élèves actuels ne changent pas."
          : 'Le tuteur ne sera pas proposé dans « Trouver un tuteur » jusqu’à cette date.'}
      </Typography>
    </Stack>
  );
};

// Block of the "Mes disponibilités" tab: state and pause for the tutor
export const NewStudentAvailability = ({ userId }) => {
  const [user, setUser] = React.useState(null);
  const load = React.useCallback(() => {
    axios
      .get(`${BASE_URL}/user-by-id/${userId}`)
      .then(({ data }) => setUser(data))
      .catch(() => setUser(null));
  }, [userId]);
  React.useEffect(() => {
    load();
    // Wishes saved elsewhere on the page can make the profile complete
    window.addEventListener('application-changed', load);
    return () => window.removeEventListener('application-changed', load);
  }, [load]);
  if (!user || user.status !== 'Validé') return null;
  let self = false;
  try {
    self = JSON.parse(localStorage.getItem('user'))?.user?.id === user.id;
  } catch {}
  return (
    <Stack
      spacing={1.5}
      sx={{ mt: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
      <Typography fontWeight={600}>
        Disponibilité pour un nouvel élève
      </Typography>
      <Box sx={{ alignSelf: 'flex-start' }}>
        <AvailabilityChip availability={user.availability} />
      </Box>
      <UnavailableControl
        userId={user.id}
        value={user.unavailable_until}
        onChange={load}
        self={self}
      />
    </Stack>
  );
};
