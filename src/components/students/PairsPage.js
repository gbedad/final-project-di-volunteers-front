import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Box, Chip, Container, Stack } from '@mui/material';
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

// Every tutor / student pair, with alerts on the pairs to follow up
const PairsPage = () => {
  const [pairs, setPairs] = useState(null);
  const [filter, setFilter] = useSessionState('pairs.filter', 'all');
  const [open, setOpen] = useState(null);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/admin/binomes`)
      .then(({ data }) => setPairs(data))
      .catch(() => setPairs([]));
  }, []);

  const count = (f) =>
    (pairs || []).filter((p) =>
      f === 'all'
        ? true
        : f === 'alerts'
          ? p.stats.alerts.length > 0
          : p.status === f
    ).length;
  const rows = useMemo(
    () =>
      (pairs || []).filter((p) =>
        filter === 'all'
          ? !['refusé', 'annulé'].includes(p.status)
          : filter === 'alerts'
            ? p.stats.alerts.length > 0
            : p.status === filter
      ),
    [pairs, filter]
  );

  const columns = [
    {
      field: 'student',
      headerName: 'Élève',
      flex: 1,
      minWidth: 160,
      valueGetter: ({ row }) =>
        row.student ? `${row.student.first_name} ${row.student.last_name}` : '',
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
          sx={{ '& .MuiDataGrid-row': { cursor: 'pointer' } }}
          disableRowSelectionOnClick
        />
      </Box>
      <PairDialog pair={open} onClose={() => setOpen(null)} />
    </Container>
  );
};

export default PairsPage;
