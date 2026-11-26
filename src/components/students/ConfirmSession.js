import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { durationLabel } from './Sessions';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const today = () =>
  new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' });

// What happened: no choice made in advance
const OUTCOMES = [
  { value: 'présent', label: 'Elle a eu lieu' },
  { value: 'absent', label: "L'élève n'est pas venu" },
  { value: 'annule_eleve', label: "Annulée par l'élève" },
  { value: 'annule_tuteur', label: 'Annulée par le tuteur' },
];
// Cancelled: by whom (attendance 'annulé')
const CANCELLED = { annule_eleve: 'eleve', annule_tuteur: 'tuteur' };
const OUTCOME_HINTS = {
  absent: 'Absence sans prévenir : comptée dans le taux d’absence.',
  annule_eleve:
    'La séance était prévue et ne s’est pas faite à cause de l’élève (ni heures, ni absence).',
  annule_tuteur:
    'La séance était prévue et ne s’est pas faite à cause du tuteur (ni heures, ni absence).',
};
const dayLabel = (d) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'numeric',
  });
const CHANNELS = [
  { value: 'appel_tuteur', label: 'Appel au tuteur' },
  { value: 'message_tuteur', label: 'Message au tuteur' },
  { value: 'famille', label: 'Contact avec la famille' },
  { value: 'wa', label: 'Messages groupés WA' },
  { value: 'non_renseigne', label: 'Non renseigné' },
  { value: 'autre', label: 'Autre' },
];
const DURATIONS = [30, 45, 60, 75, 90, 120];

// A session with nothing recorded (no MyCogniverse, Jotform or Zoom): what
// the team knows happened. It took place, the student did not come, or there
// was cancelled, by the student or by the tutor.
// pair: { id, student, tutor }, date: prefilled day, slot: that day's slot
const ConfirmSession = ({ open, pair, date, slot, onClose, onSaved }) => {
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (open) {
      setForm({
        date: date || today(),
        attendance: null,
        duration_minutes: '',
        late: false,
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
      const cancelledBy = CANCELLED[form.attendance];
      await axios.post(`${BASE_URL}/admin/binomes/${pair.id}/seances`, {
        ...form,
        attendance: cancelledBy ? 'annulé' : form.attendance,
        cancelled_by: cancelledBy || null,
      });
      toast.success('C’est renseigné', { position: 'bottom-left' });
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
        {date
          ? `Séance du ${dayLabel(date)}${slot ? `, ${slot.startTime}–${slot.endTime}` : ''}`
          : 'Renseigner une séance'}
        <Typography variant="body2" color="text.secondary">
          {pair.student?.first_name} {pair.student?.last_name} ·{' '}
          {pair.tutor?.first_name} {pair.tutor?.last_name}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {!date && (
            <TextField
              size="small"
              type="date"
              label="Date de la séance"
              value={form.date || ''}
              onChange={set('date')}
              inputProps={{ max: today() }}
              InputLabelProps={{ shrink: true }}
            />
          )}
          <Typography fontWeight={600}>Que s'est-il passé ?</Typography>
          {/* Two by two: held / not come, cancelled by the student / tutor */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 1,
            }}>
            {OUTCOMES.map((o) => (
              <Button
                key={o.value}
                variant={form.attendance === o.value ? 'contained' : 'outlined'}
                onClick={() => setForm((f) => ({ ...f, attendance: o.value }))}
                sx={{ lineHeight: 1.25 }}>
                {o.label}
              </Button>
            ))}
          </Box>
          {OUTCOME_HINTS[form.attendance] && (
            <Typography variant="caption" color="text.secondary">
              {OUTCOME_HINTS[form.attendance]}
            </Typography>
          )}
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
          {form.attendance === 'présent' && (
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={!!form.late}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, late: e.target.checked }))
                  }
                />
              }
              label={
                <Typography variant="body2">
                  L'élève est arrivé avec 15 minutes de retard ou plus
                </Typography>
              }
            />
          )}
          {form.attendance && (
            <TextField
              select
              size="small"
              label="Comment l'avez-vous su ?"
              value={form.channel || 'appel_tuteur'}
              onChange={set('channel')}>
              {CHANNELS.map((c) => (
                <MenuItem key={c.value} value={c.value}>
                  {c.label}
                </MenuItem>
              ))}
            </TextField>
          )}
          {form.attendance && (
            <TextField
              size="small"
              label="Précision"
              placeholder={
                CANCELLED[form.attendance]
                  ? 'Ex. : élève malade, prévenu par la famille'
                  : 'Ex. : appel du 12/11, séance faite à la médiathèque'
              }
              value={form.note || ''}
              onChange={set('note')}
              multiline
              minRows={2}
            />
          )}
          {form.attendance === 'présent' && (
            <Typography variant="caption" color="text.secondary">
              Le compte-rendu du tuteur reste attendu.
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          variant="contained"
          disabled={
            busy ||
            !form.date ||
            !form.attendance
          }
          onClick={save}>
          Enregistrer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmSession;
