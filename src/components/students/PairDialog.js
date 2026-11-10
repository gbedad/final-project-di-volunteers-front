import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { SessionList, formatHours } from './Sessions';
import SlotsEditor from './SlotsEditor';
import { isManager } from '../../js/roles';
import { MODALITIES } from '../../js/studentOptions';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const formatDate = (v) => (v ? new Date(v).toLocaleDateString('fr-FR') : '—');

const currentRole = () => {
  try {
    return JSON.parse(localStorage.getItem('user'))?.user?.role;
  } catch {
    return null;
  }
};

const Figure = ({ label, value }) => (
  <Stack>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography fontWeight={600}>{value}</Typography>
  </Stack>
);

const REMOTE = /^\s*(à|a) distance\s*$/i;

// Slot, modality and place agreed for the pair (not the availabilities of
// the tutor or the student)
const DetailsEditor = ({ pair, onSaved, onCancel }) => {
  const [schedule, setSchedule] = useState(pair.schedule || []);
  const [how, setHow] = useState(pair.how_location || '');
  const [site, setSite] = useState(pair.site || '');
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    try {
      const { data } = await axios.patch(
        `${BASE_URL}/admin/binomes/${pair.id}/details`,
        { schedule, how_location: how, site }
      );
      toast.success('Créneau du binôme enregistré', {
        position: 'bottom-left',
      });
      onSaved(data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Enregistrement impossible', {
        position: 'bottom-left',
      });
    } finally {
      setBusy(false);
    }
  };
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Typography fontWeight={600}>Créneau du binôme</Typography>
        <Typography variant="body2" color="text.secondary">
          L'horaire convenu pour ce binôme : il sert aux séances attendues et au
          retard. Les disponibilités du tuteur et de l'élève ne changent pas.
        </Typography>
        <SlotsEditor value={schedule} onChange={setSchedule} />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <TextField
            select
            size="small"
            label="Modalité"
            value={how}
            onChange={(e) => setHow(e.target.value)}
            sx={{ minWidth: 220 }}>
            {MODALITIES.map((m) => (
              <MenuItem key={m} value={m}>
                {m}
              </MenuItem>
            ))}
          </TextField>
          {!REMOTE.test(how) && (
            <TextField
              size="small"
              label="Site"
              value={site}
              onChange={(e) => setSite(e.target.value)}
              sx={{ flex: 1 }}
            />
          )}
        </Stack>
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button onClick={onCancel}>Annuler</Button>
          <Button variant="contained" disabled={busy} onClick={save}>
            Enregistrer
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};

// Follow-up of a pair for the team: figures, alerts and every report
const PairDialog = ({
  pair: initial,
  onClose,
  onChanged,
  showStudentLink = true,
}) => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [pair, setPair] = useState(initial);
  const [editing, setEditing] = useState(false);
  const manager = isManager(currentRole());
  // Another pair opened (the student's page passes a new object each time:
  // only the id counts)
  const initialId = initial?.id;
  useEffect(() => {
    setPair(initial);
    setEditing(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialId]);

  const pairId = pair?.id;
  const load = useCallback(() => {
    if (!pairId) return;
    axios
      .get(`${BASE_URL}/admin/binomes/${pairId}/seances`)
      .then(({ data }) => setData(data))
      .catch(() => setData({ sessions: [], stats: null }));
  }, [pairId]);
  useEffect(() => {
    setData(null);
    load();
  }, [load]);

  if (!pair) return null;
  const stats = data?.stats;
  return (
    <Dialog open={!!pair} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {pair.student
          ? `${pair.student.first_name} ${pair.student.last_name}`
          : 'Élève'}
        {' · '}
        {pair.tutor
          ? `${pair.tutor.first_name} ${pair.tutor.last_name}`
          : 'tuteur'}
        <Typography variant="body2" color="text.secondary">
          {[
            pair.subjects.join(', '),
            (pair.schedule || [])
              .map((s) => `${s.day} ${s.startTime}–${s.endTime}`)
              .join(', '),
            [pair.how_location, pair.site].filter(Boolean).join(' · '),
          ]
            .filter(Boolean)
            .join(' · ')}
        </Typography>
      </DialogTitle>
      <DialogContent>
        {!data ? (
          <LinearProgress />
        ) : (
          <Stack spacing={2}>
            {stats?.alerts?.map((a) => (
              <Alert key={a.type} severity="warning">
                {a.label}
              </Alert>
            ))}
            <Stack direction="row" spacing={4} flexWrap="wrap">
              <Figure
                label="Début"
                value={formatDate(pair.start_date || pair.responded_at)}
              />
              <Figure label="Séances faites" value={stats?.held ?? 0} />
              <Figure
                label="Heures de tutorat"
                value={formatHours(stats?.hours)}
              />
              <Figure
                label="Dernière séance"
                value={formatDate(stats?.last_session)}
              />
              <Figure
                label="Dernier compte-rendu"
                value={formatDate(stats?.last_report)}
              />
              <Figure
                label="Dernier ressenti"
                value={
                  stats?.last_progress ? `${stats.last_progress} / 5` : '—'
                }
              />
            </Stack>
            {editing ? (
              <DetailsEditor
                pair={pair}
                onCancel={() => setEditing(false)}
                onSaved={(saved) => {
                  setPair({ ...pair, ...saved });
                  setEditing(false);
                  onChanged?.();
                }}
              />
            ) : (
              manager && (
                <Button
                  size="small"
                  sx={{ alignSelf: 'flex-start' }}
                  onClick={() => setEditing(true)}>
                  Modifier le créneau, la modalité ou le lieu
                </Button>
              )
            )}
            <Typography fontWeight={600}>Comptes-rendus</Typography>
            <SessionList
              sessions={data.sessions}
              canDelete={() => manager}
              onDeleted={load}
            />
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        {showStudentLink && pair.student && (
          <Button onClick={() => navigate(`/eleves/${pair.student_id}`)}>
            Fiche de l'élève
          </Button>
        )}
        <Button variant="contained" onClick={onClose}>
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const AlertChips = ({ alerts = [] }) =>
  alerts.map((a) => (
    <Chip
      key={a.type}
      size="small"
      color="warning"
      label={a.label}
      sx={{ mr: 0.5 }}
    />
  ));

export default PairDialog;
