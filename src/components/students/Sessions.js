import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Checkbox,
  FormControlLabel,
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
import EditIcon from '@mui/icons-material/EditOutlined';
import { EXTRA_BADGES } from './ExtraSessions';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const formatDate = (v) => (v ? new Date(v).toLocaleDateString('fr-FR') : '');
const today = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' });
const DURATIONS = [30, 45, 60, 90, 120, 150, 180];
const ATTENDANCE = {
  présent: { label: 'Séance faite', color: 'success' },
  absent: { label: 'Élève absent', color: 'warning' },
  annulé: { label: 'Annulée', color: 'default' },
};
// Choices of the report: a cancelled session says by whom
const CHOICES = {
  présent: 'Séance faite',
  absent: 'Élève absent',
  annule_eleve: "Annulée par l'élève",
  annule_tuteur: 'Annulée par le tuteur',
};
const CANCELLED = { annule_eleve: 'eleve', annule_tuteur: 'tuteur' };
export const CANCELLED_LABELS = {
  eleve: "Annulée par l'élève",
  tuteur: 'Annulée par le tuteur',
};
const choiceOf = (s) =>
  s.attendance === 'annulé'
    ? s.cancelled_by === 'tuteur'
      ? 'annule_tuteur'
      : 'annule_eleve'
    : s.attendance;
// Label of a recorded session
const attendanceLabel = (s) =>
  s.attendance === 'annulé' && CANCELLED_LABELS[s.cancelled_by]
    ? CANCELLED_LABELS[s.cancelled_by]
    : ATTENDANCE[s.attendance]?.label || s.attendance;
export const PROGRESS_LABELS = {
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
    : `${Math.floor(minutes / 60)} h${
        minutes % 60 ? ` ${String(minutes % 60).padStart(2, '0')}` : ''
      }`;

// Hours as "59 min", "1 h 05", "7 h 48" (never 0,9833 h)
export const formatHours = (h) => {
  const minutes = Math.round((Number(h) || 0) * 60);
  return minutes ? durationLabel(minutes) : '0 h';
};

// One report per session, or a monthly summary: the tutor chooses
// Duration of today's session: the one already signed in, else today's slot
const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const minutesOf = (t) => {
  const m = /^(\d{1,2}):(\d{2})/.exec(t || '');
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};
// Session already signed in today (attendance sheet), if any
const signedToday = (pair) =>
  (pair?.sessions || []).find((x) => String(x.date).slice(0, 10) === today());

const defaultDuration = (pair) => {
  const signed = (pair?.sessions || []).find(
    (x) => String(x.date).slice(0, 10) === today() && x.duration_minutes
  );
  if (signed) return signed.duration_minutes;
  const slot = (pair?.schedule || []).find((x) => x.day === DAYS_FR[new Date().getDay()]);
  const d = slot ? minutesOf(slot.endTime) - minutesOf(slot.startTime) : 0;
  return d > 0 ? d : 60;
};

// The team can open the student's signature of a session
const isTeam = () => {
  try {
    return ['superadmin', 'admin', 'interviewer'].includes(
      JSON.parse(localStorage.getItem('user'))?.user?.role
    );
  } catch {
    return false;
  }
};
const openSignature = async (id) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/admin/seances/${id}/signature`);
    window.open(data.url, '_blank', 'noopener');
  } catch {
    toast.error("La signature n'a pas pu être ouverte", { position: 'bottom-left' });
  }
};

// The tutor may come back to a report this many days after the session
export const EDIT_DAYS = 30;
export const canEditReport = (s) =>
  new Date(`${String(s.date).slice(0, 10)}T12:00:00Z`) >
  Date.now() - EDIT_DAYS * 86400000;
// A day that is not one of the pair's slot days (a session in addition?)
const offSlotDay = (pair, date) =>
  !!date &&
  !(pair?.schedule || []).some(
    (x) => x.day === DAYS_FR[new Date(`${date}T12:00:00Z`).getUTCDay()]
  );

// New report, or the tutor comes back to one (session: the report; the
// date, the attendance and the duration stay as recorded)
export const SessionDialog = ({ open, pair, session, onClose, onSaved, extraMode = false }) => {
  const [form, setForm] = useState(
    session
      ? {
          date: String(session.date).slice(0, 10),
          duration_minutes: session.duration_minutes || '',
          attendance: choiceOf(session),
          late: !!session.late,
          work: session.work || '',
          progress: session.progress || 3,
          remark: session.remark || '',
        }
      : {
          date: today(),
          duration_minutes: defaultDuration(pair),
          // What was signed in today: an absence stays an absence
          attendance: signedToday(pair)?.attendance || 'présent',
          late: !!signedToday(pair)?.late,
          work: '',
          progress: 3,
          remark: '',
          // A session in addition to the slot, held that day
          extra: extraMode,
          start_time: '',
          end_time: '',
        }
  );
  const [saving, setSaving] = useState(false);
  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const held = form.attendance === 'présent';
  const editing = !!session;
  // Not when the association already set an exceptional session that day
  const askExtra =
    !editing &&
    !CANCELLED[form.attendance] &&
    (extraMode || offSlotDay(pair, form.date)) &&
    !(pair?.extras || []).some((e) => e.date === form.date);
  const extra = askExtra && form.extra;

  const save = async () => {
    setSaving(true);
    try {
      if (editing) {
        await axios.patch(`${BASE_URL}/my/seances/${session.id}`, {
          work: form.work,
          remark: form.remark,
          late: held && form.late,
          progress: held ? form.progress : null,
          duration_minutes: held ? Number(form.duration_minutes) || null : null,
        });
      } else {
        const { extra: _, start_time, end_time, ...rest } = form;
        await axios.post(`${BASE_URL}/my/binomes/${pair.id}/seances`, {
          ...rest,
          attendance: CANCELLED[form.attendance] ? 'annulé' : form.attendance,
          cancelled_by: CANCELLED[form.attendance] || null,
          ...(extra && {
            extra: { start_time, end_time },
            duration_minutes: null,
          }),
          progress: held ? form.progress : null,
        });
      }
      toast.success(
        editing ? 'Compte-rendu modifié.' : 'Compte-rendu enregistré, merci !',
        { position: 'top-center' }
      );
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
        {editing ? 'Modifier le compte-rendu' : 'Compte-rendu'} ·{' '}
        {pair?.student?.first_name} {pair?.student?.initial}
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
              disabled={editing}
              onChange={(e) => set('date', e.target.value)}
              sx={{ flex: 1, minWidth: 170 }}
            />
            <TextField
              select
              size="small"
              label="La séance"
              disabled={editing}
              value={form.attendance}
              onChange={(e) => set('attendance', e.target.value)}
              sx={{ flex: 1, minWidth: 180 }}>
              {Object.entries(CHOICES).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
            {held && !extra && (
              <TextField
                select
                size="small"
                label="Durée"
                value={form.duration_minutes}
                onChange={(e) => set('duration_minutes', e.target.value)}
                sx={{ width: 120 }}>
                {[...new Set([...DURATIONS, Number(form.duration_minutes)])]
                  .sort((a, b) => a - b)
                  .map((d) => (
                  <MenuItem key={d} value={d}>
                    {durationLabel(d)}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </Stack>
          {askExtra && (
            <Stack spacing={1}>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={!!form.extra}
                    onChange={(e) => set('extra', e.target.checked)}
                  />
                }
                label={
                  <Typography variant="body2">
                    Séance hors de mon créneau habituel
                  </Typography>
                }
              />
              {form.extra && (
                <Stack direction="row" spacing={1}>
                  <TextField
                    size="small"
                    type="time"
                    label="Début"
                    value={form.start_time}
                    onChange={(e) => set('start_time', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ step: 300 }}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    size="small"
                    type="time"
                    label="Fin"
                    value={form.end_time}
                    onChange={(e) => set('end_time', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ step: 300 }}
                    sx={{ flex: 1 }}
                  />
                </Stack>
              )}
            </Stack>
          )}
          {held && (
            <>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={form.late}
                    onChange={(e) => set('late', e.target.checked)}
                  />
                }
                label={
                  <Typography variant="body2">
                    L'élève est arrivé avec 15 minutes de retard ou plus
                  </Typography>
                }
              />
              <TextField
                size="small"
                label="Ce que vous avez travaillé"
                multiline
                minRows={2}
                value={form.work}
                onChange={(e) => set('work', e.target.value)}
              />
              {/* The question on its own line, the stars and their word
                  under it (narrow dialog, phones included) */}
              <Stack spacing={0.5}>
                <Typography variant="body2">
                  Comment s'est passée la séance ?
                </Typography>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Rating
                    value={form.progress}
                    onChange={(e, v) => set('progress', v || 1)}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {PROGRESS_LABELS[form.progress]}
                  </Typography>
                </Stack>
              </Stack>
            </>
          )}
          <TextField
            size="small"
            label="Remarque pour l'association"
            multiline
            minRows={2}
            value={form.remark}
            onChange={(e) => set('remark', e.target.value)}
          />
          <Typography variant="caption" color="text.secondary">
            {editing
              ? `Vous pouvez revenir sur un compte-rendu pendant ${EDIT_DAYS} jours après la séance. Vous pouvez corriger la durée. La date et la présence ne changent pas : demandez à l'association si elles sont fausses.`
              : 'Vous pouvez écrire un compte-rendu après chaque séance, ou un seul par mois qui résume la période.'}
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          variant="contained"
          disabled={
            saving || !form.date || (extra && (!form.start_time || !form.end_time))
          }
          onClick={save}>
          Enregistrer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Reports of a pair, newest first; canDelete(session) decides the bin
// canEdit(session) shows the pencil, onEdit(session) opens the report
export const SessionList = ({
  sessions,
  canDelete,
  onDeleted,
  canEdit,
  onEdit,
  limit,
}) => {
  // "Voir tout": the older reports too (to complete or correct them)
  const [all, setAll] = useState(false);
  const shown = limit && !all ? sessions.slice(0, limit) : sessions;
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
              flexWrap="wrap"
              useFlexGap>
              <Typography variant="body2" fontWeight={600}>
                {formatDate(s.date)}
              </Typography>
              <Chip
                size="small"
                color={ATTENDANCE[s.attendance]?.color}
                label={attendanceLabel(s)}
              />
              {s.student_signed_at && (
                <Tooltip
                  title={
                    isTeam()
                      ? 'Voir la signature'
                      : `Signée à ${new Date(s.student_signed_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
                  }>
                  <Chip
                    size="small"
                    color="success"
                    variant="outlined"
                    label="Signée par l'élève"
                    onClick={isTeam() ? () => openSignature(s.id) : undefined}
                  />
                </Tooltip>
              )}
              {s.no_signature && (
                <Chip size="small" variant="outlined" label="Non signée" />
              )}
              {s.source === 'equipe' && (
                <Tooltip title={s.confirmation || ''}>
                  <Chip size="small" variant="outlined" label="Confirmée par l'association" />
                </Tooltip>
              )}
              {s.late && (
                <Chip size="small" color="warning" variant="outlined" label="Retard" />
              )}
              {s.extra_kind && (
                <Chip
                  size="small"
                  color="secondary"
                  variant="outlined"
                  label={EXTRA_BADGES[s.extra_kind] || s.extra_kind}
                />
              )}
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
          {canEdit?.(s) && (
            <IconButton
              size="small"
              aria-label="Modifier le compte-rendu"
              onClick={() => onEdit(s)}>
              <EditIcon fontSize="small" />
            </IconButton>
          )}
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
        <Button
          size="small"
          sx={{ alignSelf: 'flex-start' }}
          onClick={() => setAll(!all)}>
          {all
            ? 'Voir moins'
            : `Voir tout (${sessions.length - limit} plus ancien${
                sessions.length - limit > 1 ? 's' : ''
              })`}
        </Button>
      )}
    </Stack>
  );
};
