import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import { SessionList, formatHours } from './Sessions';
import { isManager } from '../../js/roles';

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

// Follow-up of a pair for the team: figures, alerts and every report
const PairDialog = ({ pair, onClose, showStudentLink = true }) => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const manager = isManager(currentRole());

  const load = useCallback(() => {
    if (!pair) return;
    axios
      .get(`${BASE_URL}/admin/binomes/${pair.id}/seances`)
      .then(({ data }) => setData(data))
      .catch(() => setData({ sessions: [], stats: null }));
  }, [pair]);
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
