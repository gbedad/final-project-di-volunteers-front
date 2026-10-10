import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import SaveStatus from '../application/SaveStatus';
import { sensitiveHint } from './Interview';
import { onThreadChanged } from '../../js/whatsapp';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const EVENT = 'first-contact-changed';
// Asks the volunteer's page to change the status (after a confirmation here)
export const STATUS_EVENT = 'set-volunteer-status';

const CHANNELS = ['Téléphone', 'WhatsApp', 'E-mail', 'Visio'];
const RESULTS = ['Joint(e)', 'Pas de réponse', 'Message laissé'];
const NEXT_STEPS = [
  'Passer en entretien',
  'À recontacter',
  'Ne pas donner suite',
];

const url = (userId, path = '') =>
  `${BASE_URL}/admin/users/${userId}/first-contact${path}`;

// Summary for the top of the volunteer's page
export const FirstContactSummary = ({ userId }) => {
  const [fc, setFc] = useState(null);
  useEffect(() => {
    const load = () =>
      axios
        .get(url(userId))
        .then(({ data }) => setFc(data))
        .catch(() => setFc(null));
    load();
    window.addEventListener(EVENT, load);
    const off = onThreadChanged(load);
    return () => {
      window.removeEventListener(EVENT, load);
      off();
    };
  }, [userId]);
  if (!fc || !fc.attempts.length) return null;
  const label = fc.nextStep
    ? `Premier contact : ${fc.nextStep.toLowerCase()}`
    : `${fc.attempts.length} tentative${fc.attempts.length > 1 ? 's' : ''}${
        fc.attempts[0].result ? ` · ${fc.attempts[0].result.toLowerCase()}` : ''
      }`;
  return (
    <Chip
      size="small"
      variant="outlined"
      color={fc.isActive ? 'success' : 'default'}
      label={label}
    />
  );
};

const Choice = ({
  id,
  label,
  value,
  values,
  onChange,
  empty = 'À préciser',
}) => (
  <FormControl size="small" fullWidth sx={{ minWidth: 0 }}>
    <InputLabel shrink id={`${id}-label`}>
      {label}
    </InputLabel>
    <Select
      notched
      labelId={`${id}-label`}
      label={label}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}>
      <MenuItem value="">
        <em>{empty}</em>
      </MenuItem>
      {values.map((v) => (
        <MenuItem key={v} value={v}>
          {v}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

// "Premier contact" block: attempts (date, channel, result, by), notes and
// next step, saved as you go
const PreInterviewComponent = ({ userId }) => {
  const [fc, setFc] = useState(null);
  const [notes, setNotes] = useState('');
  const [saveState, setSaveState] = useState('idle');
  const [confirmStatus, setConfirmStatus] = useState(null);
  const timer = useRef(null);

  const load = useCallback(
    () =>
      axios
        .get(url(userId))
        .then(({ data }) => {
          setFc(data);
          setNotes(data.notes || '');
        })
        .catch(() => setFc(false)),
    [userId]
  );
  useEffect(() => {
    load();
    // WhatsApp / Gmail buttons add an attempt on the server
    return onThreadChanged(load);
  }, [load]);

  // Every change returns the whole first contact
  const send = async (method, path, body) => {
    setSaveState('saving');
    try {
      const { data } = await axios[method](url(userId, path), body);
      setFc((old) => ({ ...old, ...data }));
      setSaveState('saved');
      window.dispatchEvent(new Event(EVENT));
      return data;
    } catch (err) {
      setSaveState(err.sessionExpired ? 'expired' : 'error');
      toast.error(err.response?.data?.error || 'Enregistrement impossible', {
        position: 'bottom-left',
      });
      return null;
    }
  };
  const setAttempt = (a, field, value) => {
    setFc((old) => ({
      ...old,
      attempts: old.attempts.map((x) =>
        x.id === a.id ? { ...x, [field]: value } : x
      ),
    }));
    send('patch', `/attempts/${a.id}`, { [field]: value });
  };
  const changeNotes = (value) => {
    setNotes(value);
    setSaveState('pending');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => send('patch', '', { notes: value }), 700);
  };
  const changeStep = async (value) => {
    const data = await send('patch', '', { nextStep: value });
    if (data?.proposedStatus && data.proposedStatus !== data.status) {
      setConfirmStatus(data.proposedStatus);
    }
  };

  if (fc === null) return <LinearProgress sx={{ width: '100%' }} />;
  if (fc === false) {
    return (
      <Alert severity="error">Le premier contact n'a pas pu être chargé.</Alert>
    );
  }
  const team = fc.team || [];
  const names = [
    ...new Set([
      ...team.map((t) => t.name),
      ...fc.attempts.map((a) => a.by).filter(Boolean),
    ]),
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        useFlexGap
        gap={1}
        sx={{ mb: 1.5 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            size="small"
            color={fc.isActive ? 'success' : 'default'}
            variant={fc.isActive ? 'filled' : 'outlined'}
            label={fc.isActive ? 'Réalisé' : 'À compléter'}
          />
          <SaveStatus state={saveState} />
        </Stack>
        <Button
          size="small"
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => send('post', '/attempts', {})}>
          Nouvelle tentative
        </Button>
      </Stack>

      {fc.attempts.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Aucun contact pour l'instant. Ajoutez une tentative (appel, message…)
          ; les contacts faits avec les boutons WhatsApp et Gmail de la fiche
          s'ajoutent tout seuls.
        </Typography>
      ) : (
        <Stack spacing={1} sx={{ mb: 2 }}>
          {fc.attempts.map((a) => (
            <Paper key={a.id} variant="outlined" sx={{ p: 1.25 }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 1.25 }}>
                <TextField
                  size="small"
                  type="date"
                  label="Date"
                  InputLabelProps={{ shrink: true }}
                  value={a.date || ''}
                  onChange={(e) => setAttempt(a, 'date', e.target.value)}
                  sx={{ flex: 1 }}
                />
                <Tooltip title="Supprimer cette tentative">
                  <IconButton
                    size="small"
                    aria-label="Supprimer cette tentative"
                    onClick={() => send('delete', `/attempts/${a.id}`)}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Box
                sx={{
                  display: 'grid',
                  gap: 1.25,
                  gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                }}>
                <Choice
                  id={`fc-${a.id}-channel`}
                  label="Moyen"
                  value={a.channel}
                  values={CHANNELS}
                  onChange={(v) => setAttempt(a, 'channel', v)}
                />
                <Choice
                  id={`fc-${a.id}-result`}
                  label="Résultat"
                  value={a.result}
                  values={RESULTS}
                  onChange={(v) => setAttempt(a, 'result', v)}
                />
                <Choice
                  id={`fc-${a.id}-by`}
                  label="Réalisé par"
                  value={a.by}
                  values={names}
                  empty="—"
                  onChange={(v) => setAttempt(a, 'by', v)}
                />
              </Box>
              {a.auto && !a.result && (
                <Typography
                  variant="caption"
                  color="warning.dark"
                  sx={{ display: 'block', mt: 0.5 }}>
                  Ajoutée par le bouton {a.channel} : précisez le résultat.
                </Typography>
              )}
            </Paper>
          ))}
        </Stack>
      )}

      <Typography
        variant="body2"
        component="label"
        htmlFor={`fc-${userId}-notes`}
        sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}>
        Notes
      </Typography>
      <TextField
        id={`fc-${userId}-notes`}
        multiline
        minRows={2}
        fullWidth
        size="small"
        placeholder="Disponibilités, mission souhaitée, points à voir en entretien…"
        value={notes}
        onChange={(e) => changeNotes(e.target.value)}
        helperText={
          sensitiveHint(notes) ||
          "Uniquement ce qui est utile à la mission : pas d'âge, de santé, de religion, d'opinions, d'origine ni de vie familiale."
        }
        FormHelperTextProps={{
          sx: {
            color: sensitiveHint(notes) ? 'warning.dark' : 'text.secondary',
          },
        }}
      />

      <Box sx={{ mt: 2 }}>
        <Choice
          id={`fc-${userId}-step`}
          label="Prochaine étape"
          value={fc.nextStep}
          values={NEXT_STEPS}
          empty="À décider"
          onChange={changeStep}
        />
      </Box>
      {!fc.isActive &&
        fc.nextStep &&
        !fc.attempts.some((a) => a.result === 'Joint(e)') && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 0.5 }}>
            Le premier contact sera « réalisé » quand une tentative aura abouti
            (Joint(e)).
          </Typography>
        )}
      {fc.proposedStatus && fc.proposedStatus !== fc.status && (
        <Alert
          severity="info"
          sx={{ mt: 1.5 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => setConfirmStatus(fc.proposedStatus)}>
              Appliquer
            </Button>
          }>
          Statut proposé : « {fc.proposedStatus} »
        </Alert>
      )}

      <Dialog open={!!confirmStatus} onClose={() => setConfirmStatus(null)}>
        <DialogTitle>Passer le statut en « {confirmStatus} » ?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmStatus === 'Déclinée'
              ? 'La candidature sera déclinée. Vous pourrez revenir en arrière en changeant le statut.'
              : 'Le bénévole passera à l’étape de l’entretien.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmStatus(null)}>Plus tard</Button>
          <Button
            variant="contained"
            onClick={() => {
              window.dispatchEvent(
                new CustomEvent(STATUS_EVENT, { detail: confirmStatus })
              );
              setFc((old) => ({ ...old, status: confirmStatus }));
              setConfirmStatus(null);
            }}>
            Changer le statut
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PreInterviewComponent;
