import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import SlotsEditor from '../students/SlotsEditor';

const BASE_URL = process.env.REACT_APP_BASE_URL;
export const BREAK_REASONS = [
  { value: 'vacances', label: 'Vacances' },
  { value: 'eleve', label: 'Élève indisponible' },
  { value: 'tuteur', label: 'Tuteur indisponible' },
  { value: 'autre', label: 'Autre' },
];
const today = () =>
  new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' });
const frDay = (d) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
export const breakDates = (b) =>
  b.from === b.to
    ? `le ${frDay(b.from)}`
    : `du ${frDay(b.from)} au ${frDay(b.to)}`;
const failed = (err, text) =>
  toast.error(err.response?.data?.error || text, { position: 'top-center' });

// "Pas de séance": a day or a period, with a reason. url: the tutor's or
// the team's endpoint
export const NoSessionDialog = ({ open, url, firstName, onClose, onSaved }) => {
  const [from, setFrom] = useState(today());
  const [to, setTo] = useState('');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    try {
      await axios.post(url, { from, to: to || from, reason, note });
      toast.success('C’est noté, merci de nous avoir prévenus.', {
        position: 'top-center',
      });
      onSaved();
    } catch (err) {
      failed(err, "L'information n'a pas pu être enregistrée");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        Pas de séance{firstName ? ` avec ${firstName}` : ''}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 2, sm: 1 }}>
            <TextField
              type="date"
              size="small"
              label="Le (ou du)"
              value={from}
              inputProps={{ min: today() }}
              onChange={(e) => setFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              type="date"
              size="small"
              label="Au (facultatif)"
              value={to}
              inputProps={{ min: from }}
              onChange={(e) => setTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>
          <TextField
            select
            size="small"
            label="Motif"
            value={reason}
            onChange={(e) => setReason(e.target.value)}>
            {BREAK_REASONS.map((r) => (
              <MenuItem key={r.value} value={r.value}>
                {r.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            label="Précision"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            multiline
          />
          <Typography variant="caption" color="text.secondary">
            Pendant les vacances scolaires, rien à faire : aucune séance n'est
            attendue.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Annuler
        </Button>
        <Button
          variant="contained"
          disabled={!from || !reason || (to && to < from) || busy}
          onClick={save}>
          Enregistrer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// The tutor tells a new slot: the team applies it
export const SlotRequestDialog = ({ open, pair, onClose, onSaved }) => {
  const [schedule, setSchedule] = useState(
    (pair.schedule || []).map((s) => ({ ...s }))
  );
  const [since, setSince] = useState(today());
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const complete =
    schedule.length > 0 &&
    schedule.every(
      (s) => s.day && s.startTime && s.endTime && s.startTime < s.endTime
    );
  const save = async () => {
    setBusy(true);
    try {
      await axios.post(`${BASE_URL}/my/binomes/${pair.id}/creneau`, {
        schedule,
        since,
        note,
      });
      toast.success(
        "Merci ! L'association met à jour le créneau et vous confirme.",
        { position: 'top-center', duration: 6000 }
      );
      onSaved();
    } catch (err) {
      failed(err, "Le créneau n'a pas pu être envoyé");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Nouveau créneau avec {pair.student.first_name}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <SlotsEditor value={schedule} onChange={setSchedule} />
          <TextField
            type="date"
            size="small"
            label="À partir du"
            value={since}
            onChange={(e) => setSince(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ maxWidth: 200 }}
          />
          <TextField
            size="small"
            label="Message pour l'association"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            multiline
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Annuler
        </Button>
        <Button variant="contained" disabled={!complete || busy} onClick={save}>
          Envoyer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// "Pas de séance" to come, each with a delete button (deleteUrl(id))
export const BreaksList = ({ breaks, deleteUrl, onChanged }) => {
  if (!breaks?.length) return null;
  const remove = async (b) => {
    try {
      await axios.delete(deleteUrl(b.id));
      onChanged();
    } catch (err) {
      failed(err, "La suppression n'a pas pu être enregistrée");
    }
  };
  return (
    <Stack spacing={0.25}>
      {breaks.map((b) => (
        <Stack key={b.id} direction="row" spacing={1} alignItems="center">
          <EventBusyIcon fontSize="small" color="action" />
          <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }}>
            Pas de séance {breakDates(b)} · {b.reason_label}
            {b.note ? ` (${b.note})` : ''}
          </Typography>
          {b.to >= today() && (
            <IconButton
              size="small"
              aria-label="Retirer"
              title="Retirer : la séance est maintenue"
              onClick={() => remove(b)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      ))}
    </Stack>
  );
};
