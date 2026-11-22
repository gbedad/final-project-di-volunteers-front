import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const today = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' });

// Is there a session today for this pair (its slot of the day, or one set
// or declared for today)? Otherwise the card cannot show a sign-in
export const hasSessionToday = (pair) => {
  const day = DAYS_FR[new Date().getDay()];
  const onDay = (pair.schedule || []).some((s) => s.day === day);
  const extra = (pair.extras || []).some((e) => e.date === today());
  return onDay || extra;
};

// Today's session declared by the tutor, before the sign-in:
// mode 'moved' replaces today's slot (le créneau a été déplacé),
// mode 'addition' is a session today without a slot (a day with no session)
export const DeclareTodayDialog = ({ open, pair, mode, onClose, onDone }) => {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const moved = mode === 'moved';
  const submit = async () => {
    if (!start || !end || end <= start) {
      setError('Indiquez l’heure de début, puis une heure de fin après le début.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await axios.post(`${BASE_URL}/my/binomes/${pair.id}/declarer-aujourdhui`, {
        kind: moved ? 'remplacement' : 'supplementaire',
        start_time: start,
        end_time: end,
      });
      toast.success('Séance déclarée. Émargez-la dans « Fin de séance ».', { position: 'top-center' });
      setStart('');
      setEnd('');
      onDone();
    } catch (err) {
      setError(err.response?.data?.error || 'La séance n’a pas pu être déclarée.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        {moved
          ? 'Le créneau a été déplacé'
          : mode === 'plus'
            ? 'Ajouter une séance en plus'
            : 'Déclarer une séance aujourd’hui'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {moved
              ? `La séance d'aujourd'hui a eu lieu à un autre horaire que le créneau : elle remplace le créneau (${pair?.student?.first_name || 'l’élève'}).`
              : mode === 'plus'
                ? `${pair?.student?.first_name || 'L’élève'} a une deuxième séance aujourd’hui, en plus du créneau.`
                : `${pair?.student?.first_name || 'L’élève'} a eu une séance aujourd’hui, sans créneau prévu ce jour-là.`}
          </Typography>
          <TextField
            label="Début"
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="Fin"
            type="time"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onClose} disabled={busy}>
          Annuler
        </Button>
        <Button variant="contained" onClick={submit} disabled={busy}>
          {moved ? 'Enregistrer le nouvel horaire' : 'Déclarer la séance'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
