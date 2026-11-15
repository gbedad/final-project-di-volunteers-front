import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const BASE_URL = process.env.REACT_APP_BASE_URL;
export const EXTRA_KINDS = {
  supplementaire: 'Séance supplémentaire',
  remplacement: 'Séance de remplacement',
};
// Badge of a report on an exceptional day
export const EXTRA_BADGES = {
  supplementaire: 'Supplémentaire',
  remplacement: 'Remplacement',
};
const DAYS_FR = [
  'Dimanche',
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
];
const today = () =>
  new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' });
const addDays = (d, n) => {
  const x = new Date(`${d}T12:00:00Z`);
  x.setUTCDate(x.getUTCDate() + n);
  return x.toISOString().slice(0, 10);
};
const weekday = (d) => DAYS_FR[new Date(`${d}T12:00:00Z`).getUTCDay()];
export const frDay = (d, long = false) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString('fr-FR', {
    weekday: long ? 'long' : 'short',
    day: 'numeric',
    month: long ? 'long' : 'short',
    timeZone: 'UTC',
  });
const hours = (e) =>
  `${e.start_time.replace(':', 'h')}–${e.end_time.replace(':', 'h')}`;
const isRemote = (pair) =>
  /^\s*(à|a) distance\s*$/i.test(pair?.how_location || '');

// Slot days of the pair, 4 weeks back to 8 weeks ahead (the regular session
// a replacement stands for), days already told as "Pas de séance" left out
const slotDays = (schedule, breaks) => {
  const out = [];
  const told = (d) => (breaks || []).some((b) => d >= b.from && d <= b.to);
  for (
    let d = addDays(today(), -28);
    d <= addDays(today(), 56);
    d = addDays(d, 1)
  ) {
    for (const s of schedule || []) {
      if (s.day === weekday(d) && !told(d)) out.push({ date: d, slot: s });
    }
  }
  return out;
};

// Message for the family's WhatsApp group: the association tells the
// family (no e-mail)
export const whatsappText = (extra, firstName) => {
  const when = `le ${frDay(extra.date, true)} de ${extra.start_time.replace(':', 'h')} à ${extra.end_time.replace(':', 'h')}${extra.remote ? ' (à distance)' : ''}`;
  return extra.kind === 'remplacement'
    ? `Bonjour, la séance de tutorat de ${firstName} du ${frDay(extra.replaces_date, true)} est remplacée par une séance ${when}. Merci de nous confirmer que c'est possible.`
    : `Bonjour, une séance de tutorat supplémentaire est prévue pour ${firstName} ${when}. Merci de nous confirmer que c'est possible.`;
};

const CopyText = ({ text }) => {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Message copié', { position: 'bottom-left' });
    } catch {
      toast.error('Copie impossible : sélectionnez le texte', {
        position: 'bottom-left',
      });
    }
  };
  return (
    <Stack spacing={1}>
      <TextField
        size="small"
        multiline
        minRows={3}
        value={text}
        InputProps={{ readOnly: true }}
        onFocus={(e) => e.target.select()}
      />
      <Button
        size="small"
        variant="outlined"
        startIcon={<ContentCopyIcon />}
        onClick={copy}
        sx={{ alignSelf: 'flex-start' }}>
        Copier le message
      </Button>
    </Stack>
  );
};

// The team sets an exceptional session: in addition to the slot, or
// instead of a regular session (which becomes a "Pas de séance"). Any date,
// holidays included. pair: { id, schedule, how_location, student }
export const ExtraSessionDialog = ({
  open,
  pair,
  breaks,
  onClose,
  onSaved,
}) => {
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(null);
  const options = slotDays(pair?.schedule, breaks);
  useEffect(() => {
    if (!open) return;
    const first = (pair?.schedule || [])[0];
    setSaved(null);
    setForm({
      kind: 'supplementaire',
      date: '',
      start_time: first?.startTime || '',
      end_time: first?.endTime || '',
      remote: isRemote(pair),
      replaces_date: '',
      note: '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const replacing = form.kind === 'remplacement';

  const save = async () => {
    setBusy(true);
    try {
      const { data } = await axios.post(
        `${BASE_URL}/admin/binomes/${pair.id}/exceptionnelles`,
        form
      );
      setSaved(data);
      onSaved?.();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Enregistrement impossible', {
        position: 'bottom-left',
      });
    } finally {
      setBusy(false);
    }
  };

  if (!pair) return null;
  const firstName = pair.student?.first_name || "l'élève";
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        Séance exceptionnelle
        <Typography variant="body2" color="text.secondary">
          {pair.student?.first_name} {pair.student?.last_name} ·{' '}
          {pair.tutor?.first_name} {pair.tutor?.last_name}
        </Typography>
      </DialogTitle>
      <DialogContent>
        {saved ? (
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <Alert severity="success">
              {saved.kind_label} enregistrée : {frDay(saved.date)},{' '}
              {hours(saved)}.
              {saved.kind === 'remplacement' &&
                ` La séance du ${frDay(saved.replaces_date)} passe en « Pas de séance ».`}{' '}
              Le tuteur la voit sur sa page.
            </Alert>
            <Typography variant="body2" fontWeight={600}>
              Message pour le groupe WhatsApp de la famille
            </Typography>
            <CopyText text={whatsappText(saved, firstName)} />
          </Stack>
        ) : (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <ToggleButtonGroup
              exclusive
              fullWidth
              size="small"
              color="primary"
              value={form.kind}
              onChange={(e, v) => v && set('kind', v)}>
              <ToggleButton value="supplementaire">En plus</ToggleButton>
              <ToggleButton value="remplacement" disabled={!options.length}>
                À la place d'une séance
              </ToggleButton>
            </ToggleButtonGroup>
            <Typography variant="caption" color="text.secondary">
              {replacing
                ? 'La séance régulière passe en « Pas de séance » ; elle est rétablie si vous annulez.'
                : 'Attendue en plus des séances du créneau habituel.'}
            </Typography>
            {replacing && (
              <TextField
                select
                size="small"
                label="Séance régulière remplacée"
                value={form.replaces_date}
                onChange={(e) => {
                  const o = options.find((x) => x.date === e.target.value);
                  setForm((f) => ({
                    ...f,
                    replaces_date: e.target.value,
                    start_time: o?.slot.startTime || f.start_time,
                    end_time: o?.slot.endTime || f.end_time,
                  }));
                }}>
                {options.map((o) => (
                  <MenuItem key={o.date} value={o.date}>
                    {frDay(o.date)} · {o.slot.startTime}–{o.slot.endTime}
                    {o.date < today() ? ' (passée)' : ''}
                  </MenuItem>
                ))}
              </TextField>
            )}
            <TextField
              size="small"
              type="date"
              label={replacing ? 'Nouvelle date' : 'Date'}
              value={form.date || ''}
              onChange={(e) => set('date', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                type="time"
                label="Début"
                value={form.start_time || ''}
                onChange={(e) => set('start_time', e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
                sx={{ flex: 1 }}
              />
              <TextField
                size="small"
                type="time"
                label="Fin"
                value={form.end_time || ''}
                onChange={(e) => set('end_time', e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
                sx={{ flex: 1 }}
              />
            </Stack>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={!!form.remote}
                  onChange={(e) => set('remote', e.target.checked)}
                />
              }
              label={
                <Typography variant="body2">
                  À distance (pas d'émargement, le rapport Zoom fait foi)
                </Typography>
              }
            />
            <TextField
              size="small"
              label="Motif (facultatif)"
              placeholder="Ex. : révision avant le contrôle de maths"
              value={form.note || ''}
              onChange={(e) => set('note', e.target.value)}
            />
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        {saved ? (
          <Button variant="contained" onClick={onClose}>
            Fermer
          </Button>
        ) : (
          <>
            <Button onClick={onClose}>Annuler</Button>
            <Button
              variant="contained"
              disabled={
                busy ||
                !form.date ||
                !form.start_time ||
                !form.end_time ||
                (replacing && !form.replaces_date)
              }
              onClick={save}>
              Enregistrer
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

// Exceptional sessions of a pair; cancelUrl(id): the team can cancel one
// (not once a session is recorded that day). firstName: WhatsApp message.
export const ExtrasList = ({ extras, cancelUrl, onChanged, firstName }) => {
  const [message, setMessage] = useState(null);
  if (!extras?.length) return null;
  const cancel = async (e) => {
    try {
      await axios.delete(cancelUrl(e.id));
      onChanged?.();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Annulation impossible', {
        position: 'bottom-left',
      });
    }
  };
  return (
    <Stack spacing={0.25}>
      {extras.map((e) => (
        <Stack key={e.id} direction="row" spacing={1} alignItems="center">
          <EventAvailableIcon fontSize="small" color="secondary" />
          <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }}>
            {e.kind === 'remplacement'
              ? 'Remplacement'
              : 'Séance supplémentaire'}{' '}
            le {frDay(e.date)}, {hours(e)}
            {e.remote ? ' · à distance' : ''}
            {e.kind === 'remplacement' && e.replaces_date
              ? ` (au lieu du ${frDay(e.replaces_date)})`
              : ''}
            {e.note ? ` · ${e.note}` : ''}
          </Typography>
          {cancelUrl && firstName && e.date >= today() && (
            <Button
              size="small"
              sx={{ minWidth: 0 }}
              onClick={() => setMessage(e)}>
              WhatsApp
            </Button>
          )}
          {cancelUrl && (
            <IconButton
              size="small"
              aria-label="Annuler la séance exceptionnelle"
              title={
                e.kind === 'remplacement'
                  ? 'Annuler : la séance régulière est rétablie'
                  : 'Annuler cette séance'
              }
              onClick={() => cancel(e)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      ))}
      <Dialog
        open={!!message}
        onClose={() => setMessage(null)}
        fullWidth
        maxWidth="xs">
        <DialogTitle>Message pour la famille</DialogTitle>
        <DialogContent>
          {message && <CopyText text={whatsappText(message, firstName)} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMessage(null)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
