import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Rating,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/DeleteOutline';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const formatDate = (v) => (v ? new Date(v).toLocaleDateString('fr-FR') : '');
const today = () => new Date().toISOString().slice(0, 10);
const DURATIONS = [30, 45, 60, 90, 120];
const ATTENDANCE = {
  présent: { label: 'Séance faite', color: 'success' },
  absent: { label: 'Élève absent', color: 'warning' },
  annulé: { label: 'Annulée', color: 'default' },
};
const PROGRESS_LABELS = {
  1: 'Grosses difficultés',
  2: 'Difficile',
  3: 'Correct',
  4: 'Bien',
  5: 'Très bien',
};

// 45 -> "45 min", 90 -> "1 h 30", 120 -> "2 h"
export const durationLabel = (minutes) =>
  minutes < 60
    ? `${minutes} min`
    : `${Math.floor(minutes / 60)} h${minutes % 60 ? ` ${minutes % 60}` : ''}`;

export const formatHours = (h) =>
  h ? `${String(h).replace('.', ',')} h` : '0 h';

// One report per session, or a monthly summary: the tutor chooses
export const SessionDialog = ({ open, pair, onClose, onSaved }) => {
  const [form, setForm] = useState({
    date: today(),
    duration_minutes: 60,
    attendance: 'présent',
    work: '',
    progress: 3,
    remark: '',
  });
  const [saving, setSaving] = useState(false);
  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const held = form.attendance === 'présent';

  const save = async () => {
    setSaving(true);
    try {
      await axios.post(`${BASE_URL}/my/binomes/${pair.id}/seances`, {
        ...form,
        progress: held ? form.progress : null,
      });
      toast.success('Compte-rendu enregistré, merci !', {
        position: 'top-center',
      });
      onSaved();
      onClose();
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          "Le compte-rendu n'a pas pu être enregistré",
        {
          position: 'top-center',
        }
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Compte-rendu · {pair?.student?.first_name} {pair?.student?.initial}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction="row" gap={1} flexWrap="wrap">
            <TextField
              size="small"
              type="date"
              label="Date de la séance"
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: today() }}
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              sx={{ flex: 1, minWidth: 170 }}
            />
            <TextField
              select
              size="small"
              label="La séance"
              value={form.attendance}
              onChange={(e) => set('attendance', e.target.value)}
              sx={{ flex: 1, minWidth: 180 }}>
              {Object.entries(ATTENDANCE).map(([value, a]) => (
                <MenuItem key={value} value={value}>
                  {a.label}
                </MenuItem>
              ))}
            </TextField>
            {held && (
              <TextField
                select
                size="small"
                label="Durée"
                value={form.duration_minutes}
                onChange={(e) => set('duration_minutes', e.target.value)}
                sx={{ width: 120 }}>
                {DURATIONS.map((d) => (
                  <MenuItem key={d} value={d}>
                    {durationLabel(d)}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </Stack>
          {held && (
            <>
              <TextField
                size="small"
                label="Ce que vous avez travaillé"
                multiline
                minRows={2}
                value={form.work}
                onChange={(e) => set('work', e.target.value)}
              />
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Typography variant="body2">Comment va l'élève ?</Typography>
                <Rating
                  value={form.progress}
                  onChange={(e, v) => set('progress', v || 1)}
                />
                <Typography variant="body2" color="text.secondary">
                  {PROGRESS_LABELS[form.progress]}
                </Typography>
              </Stack>
            </>
          )}
          <TextField
            size="small"
            label="Remarque pour l'association (facultatif)"
            multiline
            minRows={2}
            value={form.remark}
            onChange={(e) => set('remark', e.target.value)}
          />
          <Typography variant="caption" color="text.secondary">
            Vous pouvez écrire un compte-rendu après chaque séance, ou un seul
            par mois qui résume la période.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          variant="contained"
          disabled={saving || !form.date}
          onClick={save}>
          Enregistrer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Reports of a pair, newest first; canDelete(session) decides the bin
export const SessionList = ({ sessions, canDelete, onDeleted, limit }) => {
  const shown = limit ? sessions.slice(0, limit) : sessions;
  if (!sessions.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        Aucun compte-rendu pour l'instant.
      </Typography>
    );
  }
  const remove = async (session) => {
    try {
      await axios.delete(`${BASE_URL}/seances/${session.id}`);
      onDeleted?.();
    } catch {
      toast.error('Suppression impossible', { position: 'bottom-left' });
    }
  };
  return (
    <Stack spacing={1}>
      {shown.map((s) => (
        <Stack
          key={s.id}
          direction="row"
          spacing={1}
          alignItems="flex-start"
          sx={{ borderLeft: 3, borderColor: 'divider', pl: 1.5 }}>
          <Stack sx={{ flex: 1 }} spacing={0.25}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap">
              <Typography variant="body2" fontWeight={600}>
                {formatDate(s.date)}
              </Typography>
              <Chip
                size="small"
                color={ATTENDANCE[s.attendance]?.color}
                label={ATTENDANCE[s.attendance]?.label || s.attendance}
              />
              {s.duration_minutes && (
                <Typography variant="caption" color="text.secondary">
                  {durationLabel(s.duration_minutes)}
                </Typography>
              )}
              {s.progress && (
                <Tooltip title={PROGRESS_LABELS[s.progress]}>
                  <span>
                    <Rating size="small" value={s.progress} readOnly />
                  </span>
                </Tooltip>
              )}
            </Stack>
            {s.work && <Typography variant="body2">{s.work}</Typography>}
            {s.remark && (
              <Typography variant="body2" color="text.secondary">
                Remarque : {s.remark}
              </Typography>
            )}
          </Stack>
          {canDelete?.(s) && (
            <IconButton
              size="small"
              aria-label="Supprimer"
              onClick={() => remove(s)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      ))}
      {limit && sessions.length > limit && (
        <Typography variant="caption" color="text.secondary">
          … et {sessions.length - limit} plus ancien(s)
        </Typography>
      )}
    </Stack>
  );
};
