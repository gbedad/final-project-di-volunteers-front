import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Alert,
  Button,
  Box,
  Chip,
  IconButton,
  Link,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  frFR,
} from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import PairDialog from './PairDialog';
import { durationLabel, formatHours } from './Sessions';
import { useSessionState } from '../../js/useSessionState';
import { JotformPendingDialog } from './JotformPending';

const BASE_URL = process.env.REACT_APP_BASE_URL;

// ---- Periods (dates as YYYY-MM-DD, Paris) ----
const iso = (d) => d.toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' });
const shift = (s, days) => {
  const d = new Date(`${s}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};
const periodOf = (key) => {
  const today = iso(new Date());
  const [y, m] = today.split('-').map(Number);
  const monday = shift(
    today,
    -((new Date(`${today}T12:00:00Z`).getUTCDay() + 6) % 7)
  );
  const pad = (n) => String(n).padStart(2, '0');
  if (key === 'week') return { from: monday, to: today };
  if (key === 'last_month') {
    const first = m === 1 ? `${y - 1}-12-01` : `${y}-${pad(m - 1)}-01`;
    return { from: first, to: shift(`${y}-${pad(m)}-01`, -1) };
  }
  // School terms: September-December, January-March, April-August
  if (key === 'term') {
    const start = m >= 9 ? `${y}-09-01` : m >= 4 ? `${y}-04-01` : `${y}-01-01`;
    return { from: start, to: today };
  }
  return { from: `${y}-${pad(m)}-01`, to: today };
};
const PERIODS = [
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois' },
  { value: 'last_month', label: 'Le mois dernier' },
  { value: 'term', label: 'Ce trimestre' },
  { value: 'custom', label: 'Dates au choix' },
];

const FILTERS = [
  { value: 'all', label: 'Toutes' },
  { value: 'présent', label: 'Présent' },
  { value: 'late', label: 'Retards', color: 'warning' },
  { value: 'absent', label: 'Absents', color: 'error' },
  { value: 'no_report', label: 'Sans compte-rendu', color: 'warning' },
  { value: 'unsigned', label: 'Non signées', color: 'warning' },
  { value: 'attendue', label: 'Rien d’enregistré', color: 'warning' },
];
const matchesFilter = (r, f) =>
  f === 'all' ||
  (f === 'attendue' && r.kind === 'attendue') ||
  (r.kind === 'session' &&
    ((f === 'présent' && r.attendance === 'présent') ||
      (f === 'late' && r.late) ||
      (f === 'absent' && r.attendance === 'absent') ||
      (f === 'no_report' && r.report === 'manquant') ||
      (f === 'unsigned' && r.signature === 'manquante')));

// Search without accents or case, every word must be found
const norm = (v) =>
  String(v || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
const matchesText = (r, q) => {
  const words = norm(q).split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const text = norm(
    [
      r.student?.first_name,
      r.student?.last_name,
      r.tutor?.first_name,
      r.tutor?.last_name,
      ...(r.subjects || []),
      r.day,
      r.remote ? 'distance' : 'site',
      r.work,
      r.remark,
    ].join(' ')
  );
  return words.every((w) => text.includes(w));
};

const fullName = (p) => (p ? `${p.first_name} ${p.last_name}` : '—');
const dateLabel = (s) =>
  new Date(`${s}T12:00:00Z`).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });
const timeLabel = (v) =>
  new Date(v).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  });

// Presence, as shown and exported
const presenceOf = (r) =>
  r.kind === 'attendue'
    ? 'Rien d’enregistré'
    : r.attendance === 'absent'
      ? 'Absent'
      : r.attendance === 'annulé'
        ? 'Annulée'
        : r.late
          ? 'Présent, très en retard'
          : 'Présent';
const presenceColor = (r) =>
  r.kind === 'attendue'
    ? 'warning'
    : r.attendance === 'absent'
      ? 'error'
      : r.attendance === 'annulé'
        ? 'default'
        : r.late
          ? 'warning'
          : 'success';
const SOURCES = {
  app: 'Application',
  jotform: 'Jotform',
  'app+jotform': 'Application + Jotform',
  zoom: 'Zoom',
  'app+zoom': 'Application + Zoom',
};
const signatureOf = (r) =>
  r.kind === 'attendue'
    ? ''
    : r.jotform_signature_url
      ? 'Signée (Jotform)'
      : r.remote || r.zoom
        ? 'À distance'
        : {
            signée: 'Signée',
            impossible: 'Ne peut pas signer',
            manquante: 'Non signée',
          }[r.signature] || '—';
// Zoom: the student's connection; remote without Zoom: nothing to sign in
const signedInOf = (r) =>
  r.signed_in_at ? timeLabel(r.signed_in_at) : r.remote ? 'À distance' : '—';
const reportOf = (r) =>
  r.report === 'fait' ? 'Fait' : r.report === 'manquant' ? 'Manquant' : '—';

const Toolbar = ({ fileName }) => (
  <GridToolbarContainer>
    <GridToolbarExport
      csvOptions={{
        delimiter: ';',
        fileName,
        utf8WithBom: true,
        allColumns: true,
      }}
      printOptions={{ disableToolbarButton: true }}
    />
  </GridToolbarContainer>
);

// Every session of a period (tab "Séances" of the page "Binômes"), with
// the sessions expected from the slots but with nothing recorded
const SessionsLog = () => {
  const [periodKey, setPeriodKey] = useSessionState('sessions.period', 'month');
  const [custom, setCustom] = useSessionState(
    'sessions.custom',
    periodOf('month')
  );
  const [filter, setFilter] = useSessionState('sessions.filter', 'all');
  const [query, setQuery] = useSessionState('sessions.query', '');
  const [hideDemo, setHideDemo] = useSessionState('pairs.hideDemo', false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(null);
  const [pendingOpen, setPendingOpen] = useState(false);
  const [reload, setReload] = useState(0);

  const period = periodKey === 'custom' ? custom : periodOf(periodKey);
  useEffect(() => {
    if (!period.from || !period.to || period.from > period.to) return;
    setData(null);
    setError(false);
    axios
      .get(`${BASE_URL}/admin/seances`, { params: period })
      .then(({ data }) => setData(data))
      .catch(() => setError(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period.from, period.to, reload]);

  // Search and demo first; the chips count what is left
  const searched = useMemo(
    () =>
      (data?.rows || []).filter(
        (r) => (!hideDemo || !r.is_demo) && matchesText(r, query)
      ),
    [data, hideDemo, query]
  );
  const rows = searched.filter((r) => matchesFilter(r, filter));
  const held = rows.filter((r) => r.kind === 'session');
  const totals = {
    sessions: held.filter((r) => r.attendance === 'présent').length,
    hours: held.reduce(
      (n, r) =>
        n + (r.attendance === 'présent' ? (r.duration_minutes || 0) / 60 : 0),
      0
    ),
    absent: held.filter((r) => r.attendance === 'absent').length,
    late: held.filter((r) => r.late).length,
    noReport: held.filter((r) => r.report === 'manquant').length,
    expected: rows.filter((r) => r.kind === 'attendue').length,
  };

  const columns = [
    {
      field: 'date',
      headerName: 'Date',
      width: 105,
      valueFormatter: ({ value }) => dateLabel(value),
    },
    {
      field: 'slot',
      headerName: 'Créneau prévu',
      width: 120,
      valueGetter: ({ row }) =>
        row.slot ? `${row.slot.startTime}–${row.slot.endTime}` : 'hors créneau',
    },
    {
      field: 'signed_in_at',
      headerName: 'Émargé à',
      description:
        "Application ou Jotform : heure de l'émargement, pendant ou à la fin de la séance (pas l'heure d'arrivée de l'élève). Zoom : heure de connexion de l'élève",
      width: 95,
      valueGetter: ({ row }) => signedInOf(row),
    },
    {
      field: 'student',
      headerName: 'Élève',
      flex: 1,
      minWidth: 200,
      valueGetter: ({ row }) => fullName(row.student),
      renderCell: ({ row, value }) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <span>{value}</span>
          {row.is_demo && <Chip size="small" label="Démo" />}
        </Stack>
      ),
    },
    {
      field: 'tutor',
      headerName: 'Tuteur',
      flex: 1,
      minWidth: 140,
      valueGetter: ({ row }) => fullName(row.tutor),
    },
    {
      field: 'subjects',
      headerName: 'Matières',
      width: 140,
      valueGetter: ({ row }) => row.subjects.join(', '),
    },
    {
      field: 'presence',
      headerName: 'Présence',
      width: 170,
      valueGetter: ({ row }) => presenceOf(row),
      renderCell: ({ row, value }) => (
        <Chip
          size="small"
          color={presenceColor(row)}
          variant={row.kind === 'attendue' ? 'outlined' : 'filled'}
          label={value}
        />
      ),
    },
    {
      field: 'duration_minutes',
      headerName: 'Durée',
      width: 75,
      valueGetter: ({ row }) =>
        row.kind === 'session' && row.attendance === 'présent'
          ? durationLabel(row.duration_minutes || 0)
          : '',
    },
    {
      field: 'signature',
      headerName: 'Signature élève',
      width: 150,
      valueGetter: ({ row }) => signatureOf(row),
      renderCell: ({ row, value }) =>
        row.signature === 'manquante' ? (
          <Chip size="small" color="warning" variant="outlined" label={value} />
        ) : row.jotform_signature_url ? (
          <Chip
            size="small"
            color="success"
            variant="outlined"
            label={value}
            title="Ouvrir la signature (connexion Jotform)"
            onClick={(e) => {
              e.stopPropagation();
              window.open(row.jotform_signature_url, '_blank', 'noopener');
            }}
          />
        ) : row.signature === 'signée' ? (
          <Chip size="small" color="success" variant="outlined" label={value} />
        ) : (
          <Typography variant="body2" color="text.secondary">
            {value}
          </Typography>
        ),
    },
    {
      field: 'report',
      headerName: 'Compte-rendu',
      width: 130,
      valueGetter: ({ row }) => reportOf(row),
      renderCell: ({ row, value }) =>
        row.report === 'manquant' ? (
          <Chip size="small" color="warning" variant="outlined" label={value} />
        ) : row.report === 'fait' ? (
          <Tooltip
            title={[row.work, row.remark].filter(Boolean).join(' — ') || ''}>
            <Chip
              size="small"
              color="success"
              variant="outlined"
              label={value}
            />
          </Tooltip>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {value}
          </Typography>
        ),
    },
    {
      field: 'progress',
      headerName: 'Ressenti',
      width: 85,
      valueGetter: ({ row }) => (row.progress ? `${row.progress} / 5` : ''),
    },
    {
      // Exported, not shown (the tooltip of "Fait" shows them)
      field: 'work',
      headerName: 'Travail réalisé',
      width: 200,
    },
    { field: 'remark', headerName: 'Remarques', width: 200 },
    {
      field: 'source',
      headerName: 'Origine',
      width: 120,
      valueGetter: ({ row }) =>
        row.kind === 'session' ? SOURCES[row.source] : '',
    },
    {
      field: 'place',
      headerName: 'Lieu',
      width: 110,
      valueGetter: ({ row }) =>
        row.remote || row.zoom ? 'À distance' : row.pair.site || 'Sur site',
    },
  ];

  return (
    <Box>
      <Stack
        direction="row"
        flexWrap="wrap"
        gap={1.5}
        alignItems="center"
        sx={{ mb: 1.5 }}>
        <TextField
          select
          size="small"
          label="Période"
          value={periodKey}
          onChange={(e) => {
            if (e.target.value === 'custom') setCustom(period);
            setPeriodKey(e.target.value);
          }}
          sx={{ width: 170 }}>
          {PERIODS.map((p) => (
            <MenuItem key={p.value} value={p.value}>
              {p.label}
            </MenuItem>
          ))}
        </TextField>
        {periodKey === 'custom' && (
          <>
            <TextField
              size="small"
              type="date"
              label="Du"
              value={custom.from}
              onChange={(e) => setCustom({ ...custom, from: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              size="small"
              type="date"
              label="Au"
              value={custom.to}
              onChange={(e) => setCustom({ ...custom, to: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </>
        )}
        <TextField
          size="small"
          label="Rechercher"
          placeholder="Élève, tuteur, matière, remarque…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Escape' && setQuery('')}
          sx={{ width: { xs: '100%', sm: 300 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: query ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setQuery('')}
                  aria-label="Effacer">
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />
        <Chip
          label="Masquer la démo"
          variant={hideDemo ? 'filled' : 'outlined'}
          color={hideDemo ? 'primary' : 'default'}
          onClick={() => setHideDemo(!hideDemo)}
        />
      </Stack>
      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 1.5 }}>
        {FILTERS.map((f) => (
          <Chip
            key={f.value}
            label={`${f.label} ${searched.filter((r) => matchesFilter(r, f.value)).length}`}
            color={f.color || 'primary'}
            variant={filter === f.value ? 'filled' : 'outlined'}
            onClick={() => setFilter(f.value)}
          />
        ))}
      </Stack>
      {error && (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          Le journal des séances n'a pas pu être chargé.
        </Alert>
      )}
      {data?.jotform_pending + data?.zoom_pending > 0 && (
        <Alert
          severity="warning"
          sx={{ mb: 1.5 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => setPendingOpen(true)}>
              Rattacher
            </Button>
          }>
          {[
            data.jotform_pending > 0 &&
              `${data.jotform_pending} signature${data.jotform_pending > 1 ? 's' : ''} Jotform`,
            data.zoom_pending > 0 &&
              `${data.zoom_pending} séance${data.zoom_pending > 1 ? 's' : ''} Zoom`,
          ]
            .filter(Boolean)
            .join(' et ')}{' '}
          à rattacher à un binôme.
        </Alert>
      )}
      {data && !data.calendar_ok && (
        <Alert severity="info" sx={{ mb: 1.5 }}>
          Le calendrier des vacances scolaires n'a pas pu être chargé : des
          séances « attendues » pendant les vacances peuvent apparaître.
        </Alert>
      )}
      <Typography variant="body2" sx={{ mb: 1 }}>
        <b>{totals.sessions}</b> séance{totals.sessions > 1 ? 's' : ''} tenue
        {totals.sessions > 1 ? 's' : ''} · <b>{formatHours(totals.hours)}</b> de
        tutorat · {totals.absent} absence{totals.absent > 1 ? 's' : ''} ·{' '}
        {totals.late} retard{totals.late > 1 ? 's' : ''} · {totals.noReport}{' '}
        compte{totals.noReport > 1 ? 's' : ''}-rendu
        {totals.noReport > 1 ? 's' : ''} manquant
        {totals.noReport > 1 ? 's' : ''} · {totals.expected} séance
        {totals.expected > 1 ? 's' : ''} attendue
        {totals.expected > 1 ? 's' : ''} sans rien d'enregistré
        {/* Jotform answers and the sync on demand (rarely needed: webhook
            and hourly check) */}
        {' · '}
        <Link
          component="button"
          variant="body2"
          color="text.secondary"
          onClick={() => setPendingOpen(true)}
          sx={{ verticalAlign: 'baseline' }}>
          Jotform et Zoom
        </Link>
      </Typography>
      <Box sx={{ height: 620, width: '100%', bgcolor: 'background.paper' }}>
        <DataGrid
          ignoreDiacritics
          rows={rows}
          columns={columns}
          loading={!data && !error}
          localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
          onRowClick={({ row }) => setOpen(row.pair)}
          sx={{ '& .MuiDataGrid-row': { cursor: 'pointer' } }}
          disableRowSelectionOnClick
          slots={{ toolbar: Toolbar }}
          slotProps={{
            toolbar: { fileName: `seances-${period.from}-au-${period.to}` },
          }}
          initialState={{
            sorting: { sortModel: [{ field: 'date', sort: 'desc' }] },
            columns: { columnVisibilityModel: { work: false, remark: false } },
          }}
        />
      </Box>
      <PairDialog pair={open} onClose={() => setOpen(null)} />
      <JotformPendingDialog
        open={pendingOpen}
        onClose={() => setPendingOpen(false)}
        onChanged={() => setReload((n) => n + 1)}
      />
    </Box>
  );
};

export default SessionsLog;
