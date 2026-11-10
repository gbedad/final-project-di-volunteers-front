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
    (norm(row.tutor_name || row.host_name).includes(norm(p.tutor?.last_name))
      ? 2
      : 0) +
    (norm(
      `${row.student_first || ''} ${row.student_names || ''} ${row.topic || ''}`
    )
      .split(/[^a-z]+/)
      .includes(norm(p.student?.first_name))
      ? 1
      : 0);
  return [...pairs].sort((a, b) => score(b) - score(a));
};

const zoomTime = (v) =>
  v
    ? new Date(v).toLocaleTimeString('fr-FR', {
        timeZone: 'Europe/Paris',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

// kind: 'jotform' (a signature) or 'zoom' (a remote session)
const PendingRow = ({ kind, row, pairs, canEdit, onDone }) => {
  const [pick, setPick] = useState('');
  const [busy, setBusy] = useState(false);
  const act = async (action) => {
    setBusy(true);
    try {
      await axios.post(
        `${BASE_URL}/admin/${kind}/pending/${row.id}/${action}`,
        action === 'match' ? { binome_id: pick } : {}
      );
      toast.success(
        action === 'match'
          ? kind === 'zoom'
            ? 'Séance enregistrée, réunion mémorisée pour ce binôme'
            : 'Séance enregistrée, nom mémorisé pour les prochaines fois'
          : 'Écartée',
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
      {kind === 'zoom' ? (
        <Typography variant="body2">
          <b>
            {frDate(row.date)} {zoomTime(row.arrival)}
          </b>{' '}
          · réunion « {row.topic || row.meeting_id} » · hôte «{' '}
          {row.host_name || row.host_email || '—'} » · connecté(s) : «{' '}
          {row.student_names || '—'} » · {row.minutes} min
        </Typography>
      ) : (
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
      )}
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

const Section = ({ title, kind, rows, pairs, canEdit, onDone, empty }) => (
  <>
    <Typography fontWeight={600} sx={{ mt: 2, mb: 1 }}>
      {title}
    </Typography>
    {rows === null ? (
      <Typography variant="body2">Chargement…</Typography>
    ) : rows.length === 0 ? (
      <Alert severity="success">{empty}</Alert>
    ) : (
      <Stack spacing={2} divider={<Divider />}>
        {rows.map((r) => (
          <PendingRow
            key={r.id}
            kind={kind}
            row={r}
            pairs={pairs}
            canEdit={canEdit}
            onDone={onDone}
          />
        ))}
      </Stack>
    )}
  </>
);

// Jotform signatures and Zoom sessions the application could not match to
// a pair: the team picks the pair (remembered for the next ones)
export const JotformPendingDialog = ({ open, onClose, onChanged }) => {
  const [rows, setRows] = useState(null);
  const [zoomRows, setZoomRows] = useState(null);
  const [pairs, setPairs] = useState([]);
  const canEdit = isManager(role());
  const load = useCallback(() => {
    axios
      .get(`${BASE_URL}/admin/jotform/pending`)
      .then(({ data }) => setRows(data))
      .catch(() => setRows([]));
    axios
      .get(`${BASE_URL}/admin/zoom/pending`)
      .then(({ data }) => setZoomRows(data))
      .catch(() => setZoomRows([]));
  }, []);
  useEffect(() => {
    if (!open) return;
    setRows(null);
    setZoomRows(null);
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
      <DialogTitle>Jotform et Zoom</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          L'application n'a pas reconnu l'élève ou le tuteur. Choisissez le
          binôme : la séance est enregistrée, et le nom (Jotform) ou la réunion
          (Zoom) est mémorisé pour les prochaines fois. « Écarter » pour un
          essai ou un élève qui n'est pas suivi dans l'application.
        </Typography>
        <Section
          title="Signatures Jotform à rattacher"
          kind="jotform"
          rows={rows}
          pairs={pairs}
          canEdit={canEdit}
          onDone={done}
          empty="Toutes les signatures sont rattachées."
        />
        <Section
          title="Séances Zoom à rattacher"
          kind="zoom"
          rows={zoomRows}
          pairs={pairs}
          canEdit={canEdit}
          onDone={done}
          empty="Toutes les séances Zoom sont rattachées."
        />
      </DialogContent>
      <DialogActions>
        {canEdit && (
          <Stack direction="row" spacing={1} sx={{ mr: 'auto' }}>
            <Button
              title="Normalement inutile : chaque signature arrive seule (webhook), et une relecture a lieu toutes les heures"
              onClick={async () => {
                if (await syncNow('jotform')) done();
              }}>
              Synchroniser Jotform
            </Button>
            <Button
              title="Normalement inutile : chaque séance arrive seule après la fin de la réunion (webhook), et une relecture a lieu toutes les heures"
              onClick={async () => {
                if (await syncNow('zoom')) done();
              }}>
              Synchroniser Zoom
            </Button>
          </Stack>
        )}
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};

// "Synchroniser Jotform / Zoom": the hourly check, now
export const syncNow = async (kind) => {
  try {
    const { data } = await axios.post(`${BASE_URL}/admin/${kind}/sync`);
    toast.success(
      `${kind === 'zoom' ? 'Zoom' : 'Jotform'} : ${data.created} séance(s) ajoutée(s), ${data.completed} complétée(s), ${data.pending} à rattacher`,
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
