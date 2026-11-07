import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Link,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { isManager } from '../../js/roles';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const role = () => {
  try {
    return JSON.parse(localStorage.getItem('user'))?.user?.role;
  } catch {
    return null;
  }
};
const norm = (v) =>
  String(v || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
const frDate = (s) =>
  new Date(`${s}T12:00:00Z`).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });
const pairLabel = (p) =>
  `${p.student?.first_name} ${p.student?.last_name} · ${p.tutor?.first_name || ''} ${
    p.tutor?.last_name || ''
  } · ${p.subjects.join(', ')}`;

// Pairs the team most likely means first: same tutor, then same first name
const ranked = (pairs, row) => {
  const score = (p) =>
    (norm(row.tutor_name).includes(norm(p.tutor?.last_name)) ? 2 : 0) +
    (norm(row.student_first).split(' ').includes(norm(p.student?.first_name))
      ? 1
      : 0);
  return [...pairs].sort((a, b) => score(b) - score(a));
};

const PendingRow = ({ row, pairs, canEdit, onDone }) => {
  const [pick, setPick] = useState('');
  const [busy, setBusy] = useState(false);
  const act = async (action) => {
    setBusy(true);
    try {
      await axios.post(
        `${BASE_URL}/admin/jotform/pending/${row.id}/${action}`,
        action === 'match' ? { binome_id: pick } : {}
      );
      toast.success(
        action === 'match'
          ? 'Séance enregistrée, nom mémorisé pour les prochaines fois'
          : 'Signature écartée',
        { position: 'bottom-left' }
      );
      onDone();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action impossible', {
        position: 'bottom-left',
      });
    } finally {
      setBusy(false);
    }
  };
  return (
    <Stack spacing={1}>
      <Typography variant="body2">
        <b>
          {frDate(row.date)} {row.arrival}
        </b>{' '}
        · élève « {row.student_first} {row.student_last} » · tuteur «{' '}
        {row.tutor_name || '—'} »
        {row.signature_url && (
          <>
            {' '}
            ·{' '}
            <Link href={row.signature_url} target="_blank" rel="noopener">
              signature
            </Link>
          </>
        )}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {row.reason}
      </Typography>
      {canEdit && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <TextField
            select
            size="small"
            label="Binôme"
            value={pick}
            onChange={(e) => setPick(e.target.value)}
            sx={{ flex: 1, minWidth: 0 }}>
            {ranked(pairs, row).map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {pairLabel(p)}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            disabled={!pick || busy}
            onClick={() => act('match')}>
            Rattacher
          </Button>
          <Button color="error" disabled={busy} onClick={() => act('discard')}>
            Écarter
          </Button>
        </Stack>
      )}
    </Stack>
  );
};

// Answers of the Jotform attendance form the application could not match
// to a pair: the team picks the pair (remembered for the next ones)
export const JotformPendingDialog = ({ open, onClose, onChanged }) => {
  const [rows, setRows] = useState(null);
  const [pairs, setPairs] = useState([]);
  const canEdit = isManager(role());
  const load = useCallback(() => {
    axios
      .get(`${BASE_URL}/admin/jotform/pending`)
      .then(({ data }) => setRows(data))
      .catch(() => setRows([]));
  }, []);
  useEffect(() => {
    if (!open) return;
    setRows(null);
    load();
    axios
      .get(`${BASE_URL}/admin/binomes`)
      .then(({ data }) =>
        setPairs(
          data.filter((p) =>
            ['actif', 'en pause', 'terminé'].includes(p.status)
          )
        )
      )
      .catch(() => setPairs([]));
  }, [open, load]);
  const done = () => {
    load();
    onChanged();
  };
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Signatures Jotform</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          L'application n'a pas reconnu l'élève ou le tuteur. Choisissez le
          binôme : la séance est enregistrée et le nom est mémorisé pour les
          prochaines signatures. « Écarter » pour un essai ou un élève qui n'est
          pas suivi dans l'application.
        </Typography>
        {rows === null ? (
          <Typography variant="body2">Chargement…</Typography>
        ) : rows.length === 0 ? (
          <Alert severity="success">
            Toutes les signatures sont rattachées.
          </Alert>
        ) : (
          <Stack spacing={2} divider={<Divider />}>
            {rows.map((r) => (
              <PendingRow
                key={r.id}
                row={r}
                pairs={pairs}
                canEdit={canEdit}
                onDone={done}
              />
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        {canEdit && (
          <Button
            sx={{ mr: 'auto' }}
            title="Normalement inutile : chaque signature arrive seule (webhook), et une relecture a lieu toutes les heures"
            onClick={async () => {
              if (await syncJotformNow()) done();
            }}>
            Synchroniser Jotform maintenant
          </Button>
        )}
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};

// "Synchroniser Jotform": the hourly check, now
export const syncJotformNow = async () => {
  try {
    const { data } = await axios.post(`${BASE_URL}/admin/jotform/sync`);
    toast.success(
      `Jotform : ${data.created} séance(s) ajoutée(s), ${data.completed} complétée(s), ${data.pending} à rattacher`,
      { position: 'bottom-left', duration: 6000 }
    );
    return true;
  } catch (err) {
    toast.error(err.response?.data?.error || 'Synchronisation impossible', {
      position: 'bottom-left',
    });
    return false;
  }
};
