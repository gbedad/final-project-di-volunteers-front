import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { DataGrid, frFR } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

import PageHeader from '../admin/PageHeader';
import { RequestDialog } from './ParentalConsent';
import {
  BulkConsentButton,
  ConsentCell,
  ConsentFilterChips,
  consentRank,
  matchesConsentFilter,
} from './ConsentOverview';
import { useSessionState } from '../../js/useSessionState';
import { isManager } from '../../js/roles';
import {
  DAYS,
  PRIORITIES,
  STUDENT_LEVELS,
  STUDENT_STATUSES,
  SUBJECTS,
  priorityLabel,
  statusColor,
} from '../../js/studentOptions';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const GRID_LOCALE = {
  ...frFR.components.MuiDataGrid.defaultProps.localeText,
  toolbarQuickFilterPlaceholder: 'Rechercher un nom…',
};

const currentRole = () => {
  try {
    return JSON.parse(localStorage.getItem('user'))?.user?.role;
  } catch {
    return null;
  }
};

// Tranche of the participation: T1…T7, T8 (QF above 2 500 €), none (QF not
// given), unknown (nothing entered yet)
export const feeKey = (s) =>
  !s.fee
    ? 'unknown'
    : s.fee.mode === 'term'
      ? `T${s.fee.tranche}`
      : s.fee.tranche
        ? 'T8'
        : 'none';
const FEE_LABELS = {
  T8: 'Tranche 8 et plus',
  none: 'QF non communiqué',
  unknown: 'Participation non renseignée',
};
const feeLabel = (k) => FEE_LABELS[k] || `Tranche ${k.slice(1)}`;

// Search without accents or case: "zoe" finds "Zoé"
const norm = (v) =>
  String(v || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
// Name of the student or of a parent, school, parent's e-mail or phone
const matchesText = (s, q) => {
  const words = norm(q).split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const text = norm(
    [
      s.first_name,
      s.last_name,
      s.school?.name,
      s.school?.city,
      s.parent1_firstname,
      s.parent1_lastname,
      s.parent1_email,
      s.parent1_phone,
      s.parent2_firstname,
      s.parent2_lastname,
      s.parent2_email,
      s.parent2_phone,
    ].join(' '),
  );
  const digits = text.replace(/[^\d]/g, '');
  return words.every(
    (w) => text.includes(w) || (/^\d{4,}$/.test(w) && digits.includes(w)),
  );
};

const age = (birthDate) => {
  if (!birthDate) return '';
  const b = new Date(birthDate);
  const now = new Date();
  let years = now.getFullYear() - b.getFullYear();
  if (now < new Date(now.getFullYear(), b.getMonth(), b.getDate())) years -= 1;
  return years;
};

// Creation: the essentials, the rest is filled in on the student's page
const NewStudentDialog = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    level: '',
  });
  const [saving, setSaving] = useState(false);
  const create = async () => {
    setSaving(true);
    try {
      const { data } = await axios.post(`${BASE_URL}/admin/students`, form);
      navigate(`/eleves/${data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || "L'élève n'a pas pu être créé", {
        position: 'bottom-left',
      });
      setSaving(false);
    }
  };
  const field = (name, label) => (
    <TextField
      size="small"
      label={label}
      value={form[name]}
      onChange={(e) => setForm({ ...form, [name]: e.target.value })}
      fullWidth
    />
  );
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Nouvel élève</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} sx={{ mt: 1 }}>
          {field('first_name', 'Prénom')}
          {field('last_name', 'Nom')}
          <TextField
            select
            size="small"
            label="Niveau"
            value={form.level}
            onChange={(e) => setForm({ ...form, level: e.target.value })}>
            {STUDENT_LEVELS.map((l) => (
              <MenuItem key={l} value={l}>
                {l}
              </MenuItem>
            ))}
          </TextField>
          <Typography variant="caption" color="text.secondary">
            La fiche s'ouvre ensuite pour compléter les besoins, les
            disponibilités et les responsables.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          variant="contained"
          disabled={saving || !form.first_name.trim() || !form.last_name.trim()}
          onClick={create}>
          Créer la fiche
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const StudentsPage = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState(null);
  const [creating, setCreating] = useState(false);
  const [status, setStatus] = useSessionState('students.status', null);
  const [subject, setSubject] = useSessionState('students.subject', null);
  const [level, setLevel] = useSessionState('students.level', null);
  const [day, setDay] = useSessionState('students.day', null);
  const [showDemo, setShowDemo] = useSessionState('students.demo', true);
  const [consent, setConsent] = useSessionState('students.consent', null);
  const [tranche, setTranche] = useSessionState('students.tranche', null);
  const [query, setQuery] = useSessionState('students.query', '');
  const [selection, setSelection] = useState([]);
  const [asking, setAsking] = useState(null);
  const canEdit = isManager(currentRole());

  const load = () =>
    axios
      .get(`${BASE_URL}/admin/students`)
      .then(({ data }) => setStudents(data))
      .catch(() => setStudents([]));
  useEffect(() => {
    load();
  }, []);

  // Search first, then the status chips count what the search found
  const searched = useMemo(
    () =>
      (students || []).filter(
        (s) =>
          (showDemo || !s.is_demo) &&
          matchesText(s, query) &&
          (!subject || (s.topics || []).some((t) => t.subject === subject)) &&
          (!level || s.level === level) &&
          (!day || (s.when_day_slot || []).some((sl) => sl.day === day)),
      ),
    [students, subject, level, day, showDemo, query],
  );
  const counts = useMemo(
    () =>
      searched.reduce((acc, s) => {
        acc[s.status] = (acc[s.status] || 0) + 1;
        return acc;
      }, {}),
    [searched],
  );
  const rows = searched.filter(
    (s) =>
      (!status || s.status === status) &&
      matchesConsentFilter(s, consent) &&
      (!tranche || feeKey(s) === tranche),
  );
  const selectedStudents = rows.filter((s) => selection.includes(s.id));
  const demoCount = (students || []).filter((s) => s.is_demo).length;

  const columns = [
    {
      field: 'name',
      headerName: 'Élève',
      flex: 1,
      minWidth: 170,
      valueGetter: ({ row }) => `${row.first_name} ${row.last_name}`,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <span>
            {row.first_name} {row.last_name}
          </span>
          {row.is_demo && <Chip size="small" label="Démo" />}
        </Stack>
      ),
    },
    { field: 'level', headerName: 'Niveau', width: 100 },
    {
      field: 'age',
      headerName: 'Âge',
      width: 70,
      valueGetter: ({ row }) => age(row.birth_date),
    },
    {
      field: 'school',
      headerName: 'Établissement',
      flex: 1,
      minWidth: 180,
      valueGetter: ({ row }) => row.school?.name || '',
      renderCell: ({ row }) => (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ overflow: 'hidden' }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {row.school?.name || ''}
          </span>
          {row.school?.rep && <Chip size="small" label={row.school.rep} />}
        </Stack>
      ),
    },
    {
      field: 'topics',
      headerName: 'Matières',
      flex: 1,
      minWidth: 180,
      valueGetter: ({ row }) =>
        (row.topics || []).map((t) => t.subject).join(', '),
    },
    {
      field: 'slots',
      headerName: 'Disponibilités',
      flex: 1,
      minWidth: 170,
      valueGetter: ({ row }) =>
        (row.when_day_slot || [])
          .map((s) => `${s.day} ${s.startTime}–${s.endTime}`)
          .join(', '),
    },
    {
      field: 'how_location',
      headerName: 'Modalité',
      width: 150,
      valueGetter: ({ row }) =>
        [row.how_location, ...(row.where_location || [])]
          .filter(Boolean)
          .join(' · '),
    },
    {
      field: 'priority',
      headerName: 'Priorité',
      width: 100,
      valueGetter: ({ row }) =>
        PRIORITIES.findIndex((p) => p.value === row.priority),
      renderCell: ({ row }) =>
        row.priority ? (
          <Chip
            size="small"
            variant="outlined"
            color={PRIORITIES.find((p) => p.value === row.priority)?.color}
            label={priorityLabel(row.priority)}
          />
        ) : null,
    },
    {
      field: 'fee',
      headerName: 'Tranche',
      description: 'Participation aux frais selon le quotient familial',
      width: 100,
      // Sort: tranches 1-7, then hourly (QF above 2 500 €, then not given)
      valueGetter: ({ row }) =>
        !row.fee
          ? 99
          : row.fee.mode === 'term'
            ? row.fee.tranche
            : row.fee.tranche
              ? 8
              : 9,
      renderCell: ({ row }) =>
        !row.fee ? null : (
          <Tooltip
            title={
              row.fee.missing
                ? 'Niveau à renseigner pour le tarif horaire'
                : row.fee.mode === 'term'
                  ? `${row.fee.amount} € par trimestre`
                  : `${row.fee.amount} € de l'heure${row.fee.tranche ? '' : ' (QF non communiqué)'}`
            }>
            <Chip
              size="small"
              variant="outlined"
              label={
                row.fee.mode === 'term'
                  ? `T${row.fee.tranche}`
                  : row.fee.tranche
                    ? 'T8 · horaire'
                    : 'Sans QF'
              }
            />
          </Tooltip>
        ),
    },
    {
      field: 'consent',
      headerName: 'Accord',
      description: 'Accord des parents',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      valueGetter: ({ row }) => consentRank(row),
      renderCell: ({ row }) => (
        <ConsentCell student={row} canEdit={canEdit} onAsk={setAsking} />
      ),
    },
    {
      field: 'status',
      headerName: 'Statut',
      width: 170,
      renderCell: ({ value }) => (
        <Chip size="small" color={statusColor(value)} label={value} />
      ),
    },
    {
      field: 'created_at',
      headerName: 'Demande',
      width: 105,
      valueFormatter: ({ value }) =>
        value ? new Date(value).toLocaleDateString('fr-FR') : '',
    },
  ];

  const filtered = !!(
    subject ||
    level ||
    day ||
    status ||
    consent ||
    tranche ||
    query
  );

  return (
    <Container maxWidth="xxl" sx={{ mt: 4, mb: 4 }}>
      <PageHeader
        title="Élèves"
        subtitle="Demandes de tutorat : besoins, disponibilités et suivi. Cliquez sur un élève pour ouvrir sa fiche."
        actions={
          canEdit && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreating(true)}>
              Nouvel élève
            </Button>
          )
        }
      />

      <Stack
        direction="row"
        flexWrap="wrap"
        alignItems="center"
        gap={1}
        sx={{ mb: 2 }}>
        <Chip
          label={`Tous ${searched.length}`}
          color="primary"
          variant={status ? 'outlined' : 'filled'}
          onClick={() => setStatus(null)}
        />
        {STUDENT_STATUSES.map((s) => (
          <Chip
            key={s.value}
            label={`${s.value} ${counts[s.value] || 0}`}
            color="primary"
            variant={status === s.value ? 'filled' : 'outlined'}
            onClick={() => setStatus(status === s.value ? null : s.value)}
          />
        ))}
        {demoCount > 0 && (
          <>
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <Tooltip title="Élèves fictifs créés pour les essais">
              <Chip
                label={`Démo ${demoCount}`}
                variant={showDemo ? 'filled' : 'outlined'}
                onClick={() => setShowDemo(!showDemo)}
              />
            </Tooltip>
          </>
        )}
      </Stack>

      <Box sx={{ mb: 2 }}>
        <ConsentFilterChips
          students={searched}
          value={consent}
          onChange={setConsent}
        />
      </Box>

      <Stack
        direction="row"
        flexWrap="wrap"
        gap={1.5}
        alignItems="center"
        sx={{ mb: 2 }}>
        <TextField
          size="small"
          label="Rechercher un élève"
          placeholder="Nom, parent, établissement, téléphone…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ width: 280 }}
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
        <Autocomplete
          size="small"
          options={SUBJECTS}
          value={subject}
          onChange={(e, v) => setSubject(v)}
          sx={{ width: 220 }}
          renderInput={(params) => <TextField {...params} label="Matière" />}
        />
        <Autocomplete
          size="small"
          options={STUDENT_LEVELS}
          value={level}
          onChange={(e, v) => setLevel(v)}
          sx={{ width: 150 }}
          renderInput={(params) => <TextField {...params} label="Niveau" />}
        />
        <Autocomplete
          size="small"
          options={DAYS}
          value={day}
          onChange={(e, v) => setDay(v)}
          sx={{ width: 150 }}
          renderInput={(params) => <TextField {...params} label="Jour" />}
        />
        <Button
          variant="outlined"
          disabled={!filtered}
          onClick={() => {
            setSubject(null);
            setLevel(null);
            setDay(null);
            setStatus(null);
            setConsent(null);
            setTranche(null);
            setQuery('');
          }}>
          Réinitialiser
        </Button>
        {tranche && (
          <Chip
            label={feeLabel(tranche)}
            onDelete={() => setTranche(null)}
            color="primary"
          />
        )}
        <Typography variant="body2" sx={{ ml: 1 }}>
          <b>
            {rows.length} élève{rows.length > 1 ? 's' : ''}
          </b>
        </Typography>
      </Stack>

      {canEdit && (
        <BulkConsentButton
          students={selectedStudents}
          onDone={() => {
            setSelection([]);
            load();
          }}
        />
      )}
      <Box sx={{ height: 640, width: '100%', bgcolor: 'background.paper' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={students === null}
          localeText={GRID_LOCALE}
          // The tick box and the consent icon don't open the student's page
          onCellClick={({ field, row }) => {
            if (field === '__check__' || field === 'consent') return;
            navigate(`/eleves/${row.id}`);
          }}
          checkboxSelection={canEdit}
          rowSelectionModel={selection}
          onRowSelectionModelChange={setSelection}
          sx={{ '& .MuiDataGrid-row': { cursor: 'pointer' } }}
          initialState={{
            sorting: { sortModel: [{ field: 'priority', sort: 'asc' }] },
          }}
          disableRowSelectionOnClick
        />
      </Box>

      <NewStudentDialog open={creating} onClose={() => setCreating(false)} />
      {asking && (
        <RequestDialog
          student={asking}
          open
          onClose={() => setAsking(null)}
          onSent={load}
        />
      )}
    </Container>
  );
};

export default StudentsPage;
