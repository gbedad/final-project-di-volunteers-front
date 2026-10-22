import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Chip,
  Container,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { DataGrid, frFR } from '@mui/x-data-grid';
import PageHeader from '../admin/PageHeader';
import PairDialog, { AlertChips } from './PairDialog';
import { PAIR_STATUS } from './StudentPairs';
import { formatHours } from './Sessions';
import { useSessionState } from '../../js/useSessionState';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const formatDate = (v) => (v ? new Date(v).toLocaleDateString('fr-FR') : '');
const FILTERS = [
  { value: 'all', label: 'Tous' },
  { value: 'alerts', label: 'Avec alerte', color: 'warning' },
  { value: 'actif', label: 'Actifs' },
  { value: 'proposé', label: 'Propositions' },
  { value: 'en pause', label: 'En pause' },
  { value: 'terminé', label: 'Terminés' },
];

// Search without accents or case: "helene" finds "Hélène"
const norm = (v) =>
  String(v || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
// Usual short names of the subjects ("maths", "géo", "PC"…)
const SUBJECT_ALIASES = {
  Mathématiques: 'maths',
  'Physique-Chimie': 'pc',
  'Histoire-Géographie': 'hg geo',
  Géographie: 'geo',
  Informatique: 'info',
  Philosophie: 'philo',
};

// Every word typed must be found in the pair: "jade maths" gives Jade's
// maths pair only
const matchesText = (p, q) => {
  const words = norm(q).split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const text = norm(
    [
      p.student?.first_name,
      p.student?.last_name,
      p.student?.level,
      p.tutor?.first_name,
      p.tutor?.last_name,
      ...(p.subjects || []).map((x) => `${x} ${SUBJECT_ALIASES[x] || ''}`),
      ...(p.schedule || []).map((sl) => sl.day),
      p.how_location,
      p.site,
    ].join(' ')
  );
  return words.every((w) => text.includes(w));
};

// Every tutor / student pair, with alerts on the pairs to follow up
const PairsPage = () => {
  const [pairs, setPairs] = useState(null);
  const [filter, setFilter] = useSessionState('pairs.filter', 'all');
  const [open, setOpen] = useState(null);
  const [query, setQuery] = useSessionState('pairs.query', '');

  useEffect(() => {
    axios
      .get(`${BASE_URL}/admin/binomes`)
      .then(({ data }) => setPairs(data))
      .catch(() => setPairs([]));
  }, []);

  // Search first, then the chips count what the search found
  const searched = useMemo(
    () => (pairs || []).filter((p) => matchesText(p, query)),
    [pairs, query]
  );
  const count = (f) =>
    searched.filter((p) =>
      f === 'all'
        ? true
        : f === 'alerts'
          ? p.stats.alerts.length > 0
          : p.status === f
    ).length;
  const rows = useMemo(
    () =>
      searched.filter((p) =>
        filter === 'all'
          ? !['refusé', 'annulé'].includes(p.status)
          : filter === 'alerts'
            ? p.stats.alerts.length > 0
            : p.status === filter
      ),
    [searched, filter]
  );

  const columns = [
    {
      field: 'student',
      headerName: 'Élève',
      flex: 1,
      minWidth: 160,
      valueGetter: ({ row }) =>
        row.student ? `${row.student.first_name} ${row.student.last_name}` : '',
      // First name, then last name; accents and capitals ignored
      sortComparator: (a, b) =>
        a.localeCompare(b, 'fr', { sensitivity: 'base' }),
      renderCell: ({ row, value }) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <span>{value}</span>
          {row.student?.is_demo && <Chip size="small" label="Démo" />}
        </Stack>
      ),
    },
    {
      field: 'level',
      headerName: 'Niveau',
      width: 90,
      valueGetter: ({ row }) => row.student?.level || '',
    },
    {
      field: 'tutor',
      headerName: 'Tuteur',
      flex: 1,
      minWidth: 160,
      valueGetter: ({ row }) =>
        row.tutor ? `${row.tutor.first_name} ${row.tutor.last_name}` : '',
    },
    {
      field: 'subjects',
      headerName: 'Matières',
      flex: 1,
      minWidth: 150,
      valueGetter: ({ row }) => row.subjects.join(', '),
    },
    {
      field: 'status',
      headerName: 'Statut',
      width: 130,
      renderCell: ({ value }) => (
        <Chip
          size="small"
          color={PAIR_STATUS[value]?.color}
          label={value.charAt(0).toUpperCase() + value.slice(1)}
        />
      ),
    },
    {
      field: 'held',
      headerName: 'Séances',
      width: 85,
      type: 'number',
      valueGetter: ({ row }) => row.stats.held,
    },
    {
      field: 'hours',
      headerName: 'Heures',
      width: 80,
      type: 'number',
      valueGetter: ({ row }) => row.stats.hours,
      valueFormatter: ({ value }) => formatHours(value),
    },
    {
      field: 'last_report',
      headerName: 'Dernier CR',
      width: 110,
      valueGetter: ({ row }) => row.stats.last_report,
      valueFormatter: ({ value }) => formatDate(value),
    },
    {
      field: 'alerts',
      headerName: 'Alertes',
      flex: 1.2,
      minWidth: 220,
      valueGetter: ({ row }) => row.stats.alerts.map((a) => a.label).join(', '),
      renderCell: ({ row }) => <AlertChips alerts={row.stats.alerts} />,
    },
  ];

  return (
    <Container maxWidth="xxl" sx={{ mt: 4, mb: 4 }}>
      <PageHeader
        title="Binômes"
        subtitle="Suivi des binômes tuteur / élève : séances, heures et alertes. Cliquez sur un binôme pour voir ses comptes-rendus."
      />
      <TextField
        size="small"
        label="Rechercher un binôme"
        placeholder="Élève, tuteur, matière, jour…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && setQuery('')}
        sx={{ width: { xs: '100%', sm: 320 }, mb: 1.5 }}
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
      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
        {FILTERS.map((f) => (
          <Chip
            key={f.value}
            label={`${f.label} ${count(f.value)}`}
            color={f.color || 'primary'}
            variant={filter === f.value ? 'filled' : 'outlined'}
            onClick={() => setFilter(f.value)}
          />
        ))}
      </Stack>
      <Box sx={{ height: 600, width: '100%', bgcolor: 'background.paper' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={pairs === null}
          localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
          onRowClick={({ row }) => setOpen(row)}
          // Default order: students' first names, A to Z
          initialState={{
            sorting: { sortModel: [{ field: 'student', sort: 'asc' }] },
          }}
          sx={{ '& .MuiDataGrid-row': { cursor: 'pointer' } }}
          disableRowSelectionOnClick
        />
      </Box>
      <PairDialog pair={open} onClose={() => setOpen(null)} />
    </Container>
  );
};

export default PairsPage;
