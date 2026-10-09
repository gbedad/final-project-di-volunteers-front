import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Chip,
  Container,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';
import { DataGrid, frFR } from '@mui/x-data-grid';
import CircleIcon from '@mui/icons-material/Circle';

import PageHeader from './PageHeader';
import { ROLE_LABELS } from '../../js/roles';
import { useSessionState } from '../../js/useSessionState';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const REFRESH_MS = 60 * 1000;
const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

const session = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};

// "à l'instant", "il y a 12 min", "aujourd'hui 14:32", "hier 09:10",
// "il y a 3 jours", "12/09/2026", "jamais"
export const sinceLabel = (date, now = Date.now()) => {
  if (!date) return 'jamais';
  const d = new Date(date);
  const diff = now - d;
  const time = d.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  if (diff < 2 * MINUTE) return "à l'instant";
  if (diff < 60 * MINUTE) return `il y a ${Math.round(diff / MINUTE)} min`;
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  if (d >= today) return `aujourd'hui ${time}`;
  if (d >= today - DAY) return `hier ${time}`;
  if (diff < 7 * DAY) return `il y a ${Math.ceil((today - d) / DAY)} jours`;
  return d.toLocaleDateString('fr-FR');
};

const fullName = (u) => [u.first_name, u.last_name].filter(Boolean).join(' ');

const PERIODS = [
  { value: 'online', label: 'Connectés' },
  { value: 'today', label: "Aujourd'hui" },
  { value: 'week', label: '7 derniers jours' },
  { value: 'never', label: 'Jamais connectés' },
];

// "Connected now" box of one group (team or volunteers)
const OnlineBox = ({ title, people, onOpen }) => (
  <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
      <CircleIcon
        sx={{
          fontSize: 12,
          color: people.length ? 'success.main' : 'grey.400',
        }}
      />
      <Typography fontWeight={600}>
        {title} : {people.length} connecté{people.length > 1 ? 's' : ''}
      </Typography>
    </Stack>
    {people.length === 0 ? (
      <Typography variant="body2" color="text.secondary">
        Personne en ce moment.
      </Typography>
    ) : (
      <Stack direction="row" flexWrap="wrap" gap={1}>
        {people.map((u) => (
          <Tooltip key={u.id} title={`Actif ${sinceLabel(u.last_seen_at)}`}>
            <Chip
              size="small"
              color="success"
              variant="outlined"
              label={`${fullName(u)}${u.role !== 'volunteer' ? ` · ${ROLE_LABELS[u.role] || u.role}` : ''}`}
              onClick={onOpen ? () => onOpen(u) : undefined}
            />
          </Tooltip>
        ))}
      </Stack>
    )}
  </Paper>
);

// Who uses MyCogniverse now and when each person last came. Superadmin: the
// team and the volunteers, apart; admin: the volunteers only (the server
// sends nothing else).
const Connections = () => {
  const navigate = useNavigate();
  const userLogged = session();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [tab, setTab] = useSessionState('connections.tab', 'volunteers');
  const [period, setPeriod] = useSessionState('connections.period', null);

  const load = useCallback(() => {
    axios
      .get(`${BASE_URL}/admin/connections`)
      .then(({ data }) => {
        setData(data);
        setNow(Date.now());
        setError(false);
      })
      .catch((err) =>
        setError(err.response?.status === 403 ? 'forbidden' : true),
      );
  }, []);
  useEffect(() => {
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  const isOnline = useCallback(
    (u) =>
      !!u.last_seen_at &&
      now - new Date(u.last_seen_at) < (data?.online_minutes || 5) * MINUTE,
    [now, data],
  );
  const inPeriod = useCallback(
    (u, p) => {
      if (!p) return true;
      if (p === 'online') return isOnline(u);
      if (p === 'never') return !u.last_seen_at;
      if (!u.last_seen_at) return false;
      if (p === 'today') {
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        return new Date(u.last_seen_at) >= today;
      }
      return now - new Date(u.last_seen_at) < 7 * DAY;
    },
    [isOnline, now],
  );

  const hasTeam = !!data?.team;
  const current =
    hasTeam && tab === 'team' ? data.team : data?.volunteers || [];
  const rows = useMemo(
    () => current.filter((u) => inPeriod(u, period)),
    [current, period, inPeriod],
  );

  const openVolunteer = (u) =>
    navigate('/change-status', { state: { userId: u.id, userLogged } });

  const columns = [
    {
      field: 'online',
      headerName: '',
      width: 50,
      sortable: false,
      valueGetter: ({ row }) => isOnline(row),
      renderCell: ({ value }) =>
        value ? (
          <Tooltip title="Connecté maintenant">
            <CircleIcon sx={{ fontSize: 12, color: 'success.main' }} />
          </Tooltip>
        ) : null,
    },
    {
      field: 'name',
      headerName: 'Nom',
      flex: 1,
      minWidth: 180,
      valueGetter: ({ row }) => fullName(row),
      renderCell: ({ row, value }) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <span>{value}</span>
          {row.is_demo && <Chip size="small" label="Démo" />}
        </Stack>
      ),
    },
    { field: 'email', headerName: 'E-mail', flex: 1, minWidth: 200 },
    tab === 'team' && hasTeam
      ? {
          field: 'role',
          headerName: 'Rôle',
          width: 130,
          valueGetter: ({ value }) => ROLE_LABELS[value] || value,
        }
      : { field: 'status', headerName: 'Statut', width: 140 },
    {
      field: 'last_seen_at',
      headerName: 'Dernière activité',
      width: 170,
      // Sorted by date, shown as "il y a 12 min"
      valueGetter: ({ value }) => (value ? new Date(value).getTime() : 0),
      renderCell: ({ row }) => sinceLabel(row.last_seen_at, now),
    },
    {
      field: 'last_login_at',
      headerName: 'Dernière connexion',
      width: 170,
      valueGetter: ({ value }) => (value ? new Date(value).getTime() : 0),
      renderCell: ({ row }) =>
        row.last_login_at
          ? new Date(row.last_login_at).toLocaleString('fr-FR', {
              dateStyle: 'short',
              timeStyle: 'short',
            })
          : '—',
    },
    {
      field: 'created_at',
      headerName: 'Inscription',
      width: 110,
      valueFormatter: ({ value }) =>
        value ? new Date(value).toLocaleDateString('fr-FR') : '',
    },
  ];

  const counts = Object.fromEntries(
    PERIODS.map((p) => [
      p.value,
      current.filter((u) => inPeriod(u, p.value)).length,
    ]),
  );
  const onlineTeam = (data?.team || []).filter(isOnline);
  const onlineVolunteers = (data?.volunteers || []).filter(isOnline);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <PageHeader
        title="Connexions"
        subtitle={`Qui utilise MyCogniverse en ce moment (actif dans les ${
          data?.online_minutes || 5
        } dernières minutes) et quand chacun est venu pour la dernière fois. Mise à jour chaque minute.`}
      />
      {error === 'forbidden' ? (
        <Alert severity="info">
          Cette page est réservée aux administrateurs.
        </Alert>
      ) : (
        error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Les connexions n'ont pas pu être chargées.
          </Alert>
        )
      )}
      {error !== 'forbidden' && (
        <>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {hasTeam && (
              <Grid item xs={12} md={6}>
                <OnlineBox title="Équipe" people={onlineTeam} />
              </Grid>
            )}
            <Grid item xs={12} md={hasTeam ? 6 : 12}>
              <OnlineBox
                title="Bénévoles"
                people={onlineVolunteers}
                onOpen={openVolunteer}
              />
            </Grid>
          </Grid>

          {hasTeam && (
            <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2, mt: -1 }}>
              <Tab value="team" label={`Équipe (${data.team.length})`} />
              <Tab
                value="volunteers"
                label={`Bénévoles (${data.volunteers.length})`}
              />
            </Tabs>
          )}

          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
            <Chip
              label={`Tous ${current.length}`}
              color="primary"
              variant={period ? 'outlined' : 'filled'}
              onClick={() => setPeriod(null)}
            />
            {PERIODS.map((p) => (
              <Chip
                key={p.value}
                label={`${p.label} ${counts[p.value]}`}
                color={p.value === 'online' ? 'success' : 'primary'}
                variant={period === p.value ? 'filled' : 'outlined'}
                onClick={() => setPeriod(period === p.value ? null : p.value)}
              />
            ))}
          </Stack>

          <Box sx={{ height: 600, width: '100%', bgcolor: 'background.paper' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              loading={!data && !error}
              localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
              initialState={{
                sorting: {
                  sortModel: [{ field: 'last_seen_at', sort: 'desc' }],
                },
              }}
              onRowClick={
                tab === 'team' && hasTeam
                  ? undefined
                  : ({ row }) => openVolunteer(row)
              }
              sx={
                tab === 'team' && hasTeam
                  ? undefined
                  : { '& .MuiDataGrid-row': { cursor: 'pointer' } }
              }
              disableRowSelectionOnClick
            />
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: 'block' }}>
            Seules les dates sont enregistrées (dernière connexion, dernière
            activité), à partir du{' '}
            {new Date(2026, 9, 9).toLocaleDateString('fr-FR')}.
          </Typography>
        </>
      )}
    </Container>
  );
};

export default Connections;
