import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { durationLabel } from './Sessions';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const today = () =>
  new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' });

const ATTENDANCES = [
  { value: 'présent', label: 'La séance a eu lieu' },
  { value: 'absent', label: "L'élève n'est pas venu" },
  { value: 'annulé', label: 'Séance annulée' },
];
const CHANNELS = [
  { value: 'appel_tuteur', label: 'Appel au tuteur' },
  { value: 'message_tuteur', label: 'Message au tuteur' },
  { value: 'famille', label: 'Contact avec la famille' },
  { value: 'autre', label: 'Autre' },
];
const DURATIONS = [30, 45, 60, 75, 90, 120];

// A session the team knows took place, with no sign-in (no MyCogniverse,
// Jotform or Zoom): pair: { id, student, tutor }, date: prefilled day
const ConfirmSession = ({ open, pair, date, onClose, onSaved }) => {
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (open) {
      setForm({
        date: date || today(),
        attendance: 'présent',
        duration_minutes: '',
        channel: 'appel_tuteur',
        note: '',
      });
    }
  }, [open, date]);
  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const save = async () => {
    setBusy(true);
    try {
      await axios.post(`${BASE_URL}/admin/binomes/${pair.id}/seances`, form);
      toast.success('Séance enregistrée', { position: 'bottom-left' });
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Enregistrement impossible', {
        position: 'bottom-left',
      });
    } finally {
      setBusy(false);
    }
  };

  if (!pair) return null;
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        Confirmer une séance
        <Typography variant="body2" color="text.secondary">
          {pair.student?.first_name} {pair.student?.last_name} ·{' '}
          {pair.tutor?.first_name} {pair.tutor?.last_name}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Séance sans émargement (ni MyCogniverse, ni Jotform, ni Zoom) dont
            l'association est sûre. Le compte-rendu du tuteur reste attendu.
          </Typography>
          <TextField
            size="small"
            type="date"
            label="Date de la séance"
            value={form.date || ''}
            onChange={set('date')}
            inputProps={{ max: today() }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            select
            size="small"
            label="La séance"
            value={form.attendance || 'présent'}
            onChange={set('attendance')}>
            {ATTENDANCES.map((a) => (
              <MenuItem key={a.value} value={a.value}>
                {a.label}
              </MenuItem>
            ))}
          </TextField>
          {form.attendance === 'présent' && (
            <TextField
              select
              size="small"
              label="Durée"
              value={form.duration_minutes}
              onChange={set('duration_minutes')}
              SelectProps={{ displayEmpty: true }}
              InputLabelProps={{ shrink: true }}>
              <MenuItem value="">Celle du créneau prévu</MenuItem>
              {DURATIONS.map((d) => (
                <MenuItem key={d} value={d}>
                  {durationLabel(d)}
                </MenuItem>
              ))}
            </TextField>
          )}
          <TextField
            select
            size="small"
            label="Comment l'avez-vous confirmé ?"
            value={form.channel || 'appel_tuteur'}
            onChange={set('channel')}>
            {CHANNELS.map((c) => (
              <MenuItem key={c.value} value={c.value}>
                {c.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            label="Précision"
            placeholder="Ex. : appel du 12/11, séance faite à la médiathèque"
            value={form.note || ''}
            onChange={set('note')}
            multiline
            minRows={2}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          variant="contained"
          disabled={busy || !form.date}
          onClick={save}>
          Enregistrer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmSession;
