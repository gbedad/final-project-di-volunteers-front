import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockIcon from '@mui/icons-material/Lock';

import PageHeader from '../admin/PageHeader';
import SaveStatus from '../application/SaveStatus';
import SchoolField from './SchoolField';
import SlotsEditor from './SlotsEditor';
import TopicsEditor from './TopicsEditor';
import StudentPairs from './StudentPairs';
import { useStudentAutoSave } from '../../js/useStudentAutoSave';
import { isManager } from '../../js/roles';
import {
  GOALS,
  MODALITIES,
  PRIORITIES,
  REFERRAL_SOURCES,
  SITES,
  STUDENT_LEVELS,
  STUDENT_STATUSES,
  TRACKS,
  statusColor,
} from '../../js/studentOptions';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const LYCEE = ['Seconde', 'Première', 'Terminale'];

const currentRole = () => {
  try {
    return JSON.parse(localStorage.getItem('user'))?.user?.role;
  } catch {
    return null;
  }
};

const Block = ({ title, children, note }) => (
  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
    <Typography fontWeight={600} sx={{ mb: note ? 0.5 : 1.5 }}>
      {title}
    </Typography>
    {note && (
      <Typography
        variant="caption"
        color="text.secondary"
        component="div"
        sx={{ mb: 1.5 }}>
        {note}
      </Typography>
    )}
    <Stack spacing={1.5}>{children}</Stack>
  </Paper>
);

const toDateInput = (value) => (value ? String(value).slice(0, 10) : '');

// Student's page: everything needed to plan lessons, saved as you type
const StudentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [error, setError] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saveState, schedule] = useStudentAutoSave(id);
  const canEdit = isManager(currentRole());

  const load = useCallback(() => {
    axios
      .get(`${BASE_URL}/admin/students/${id}`)
      .then(({ data }) => setStudent(data))
      .catch(() => setError(true));
  }, [id]);
  useEffect(load, [load]);
  // A pair accepted, paused or ended changes the student's status
  const reloadStatus = () =>
    axios
      .get(`${BASE_URL}/admin/students/${id}`)
      .then(({ data }) => setStudent((s) => ({ ...s, status: data.status })))
      .catch(() => {});

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Élève introuvable.</Alert>
      </Container>
    );
  }
  if (!student) return <LinearProgress sx={{ mt: 4 }} />;

  // Local update + autosave; text fields are sent while typing
  const set = (field, value) => {
    setStudent((s) => ({ ...s, [field]: value }));
    if (canEdit) schedule({ [field]: value });
  };
  const text = (field, label, props = {}) => (
    <TextField
      size="small"
      label={label}
      value={student[field] || ''}
      onChange={(e) => set(field, e.target.value)}
      disabled={!canEdit}
      fullWidth
      {...props}
    />
  );
  const select = (field, label, options, props = {}) => (
    <TextField
      select
      size="small"
      label={label}
      value={student[field] || ''}
      onChange={(e) => set(field, e.target.value)}
      disabled={!canEdit}
      fullWidth
      {...props}>
      {options.map((o) => {
        const value = typeof o === 'string' ? o : o.value;
        return (
          <MenuItem key={value} value={value}>
            {typeof o === 'string' ? o : o.label || o.value}
          </MenuItem>
        );
      })}
    </TextField>
  );

  const remove = async () => {
    try {
      await axios.delete(`${BASE_URL}/admin/students/${id}`);
      toast.success('Élève supprimé', { position: 'bottom-left' });
      navigate('/eleves');
    } catch {
      toast.error("L'élève n'a pas pu être supprimé", {
        position: 'bottom-left',
      });
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Button
        size="small"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/eleves')}
        sx={{ mb: 1 }}>
        Élèves
      </Button>
      <PageHeader
        title={`${student.first_name || ''} ${student.last_name || ''}`}
        subtitle={[
          student.level,
          student.school?.name,
          student.created_at &&
            `demande du ${new Date(student.created_at).toLocaleDateString('fr-FR')}`,
        ]
          .filter(Boolean)
          .join(' · ')}
        actions={
          <Stack direction="row" spacing={1} alignItems="center">
            {student.is_demo && <Chip size="small" label="Démo" />}
            <Chip
              size="small"
              color={statusColor(student.status)}
              label={student.status}
            />
            <SaveStatus state={saveState} />
          </Stack>
        }
      />

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Block title="Identité et scolarité">
            <Stack direction="row" spacing={1}>
              {text('first_name', 'Prénom')}
              {text('last_name', 'Nom')}
            </Stack>
            <TextField
              size="small"
              type="date"
              label="Date de naissance"
              InputLabelProps={{ shrink: true }}
              value={toDateInput(student.birth_date)}
              onChange={(e) => set('birth_date', e.target.value || null)}
              disabled={!canEdit}
            />
            <Stack direction="row" spacing={1}>
              {select('level', 'Niveau', STUDENT_LEVELS)}
              {LYCEE.includes(student.level) &&
                select('track', 'Filière', TRACKS)}
            </Stack>
            <SchoolField
              value={student.school}
              onChange={(school) => set('school', school)}
            />
          </Block>

          <Block
            title="Responsables légaux"
            note="Les tuteurs ne reçoivent pas ces coordonnées : les échanges passent par l'association.">
            {[1, 2].map((n) => (
              <Box key={n}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}>
                  Responsable {n}
                  {n === 2 ? ' (facultatif)' : ''}
                </Typography>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1}>
                    {text(`parent${n}_firstname`, 'Prénom')}
                    {text(`parent${n}_lastname`, 'Nom')}
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    {text(`parent${n}_phone`, 'Téléphone')}
                    {text(`parent${n}_email`, 'E-mail')}
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Block>

          <Block title="Orientation">
            {select('referral_source', 'Adressé par', REFERRAL_SOURCES)}
            {text('referral_contact', 'Référent (nom, fonction, contact)')}
          </Block>
        </Grid>

        <Grid item xs={12} md={4}>
          <Block title="Besoins">
            <TopicsEditor
              value={student.topics || []}
              onChange={(topics) => set('topics', topics)}
            />
            <Autocomplete
              multiple
              size="small"
              options={GOALS}
              value={student.goals || []}
              onChange={(e, goals) => set('goals', goals)}
              disabled={!canEdit}
              renderInput={(params) => (
                <TextField {...params} label="Objectifs" />
              )}
            />
            {text('needs', 'Description des besoins', {
              multiline: true,
              minRows: 3,
            })}
          </Block>

          <Block
            title="Besoins particuliers"
            note={
              <Stack direction="row" spacing={0.5} alignItems="center">
                <LockIcon sx={{ fontSize: 14 }} />
                <span>
                  Visible uniquement par l'équipe (troubles dys, handicap,
                  aménagements). Données de santé : à ne renseigner qu'avec
                  l'accord des parents.
                </span>
              </Stack>
            }>
            {text('special_needs', 'Besoins particuliers', {
              multiline: true,
              minRows: 2,
            })}
          </Block>

          <Block title="Disponibilités et lieu">
            <SlotsEditor
              value={student.when_day_slot || []}
              onChange={(slots) => set('when_day_slot', slots)}
            />
            {select('how_location', 'Modalité', MODALITIES)}
            {student.how_location !== 'A distance' && (
              <Autocomplete
                multiple
                size="small"
                options={SITES}
                value={student.where_location || []}
                onChange={(e, sites) => set('where_location', sites)}
                disabled={!canEdit}
                renderInput={(params) => (
                  <TextField {...params} label="Sites possibles" />
                )}
              />
            )}
          </Block>
        </Grid>

        <Grid item xs={12} md={4}>
          <Block title="Tuteur">
            <StudentPairs
              student={student}
              canEdit={canEdit}
              onChanged={reloadStatus}
            />
          </Block>
          <Block title="Suivi de la demande">
            {select(
              'status',
              'Statut',
              STUDENT_STATUSES.map((s) => s.value)
            )}
            {select('priority', 'Priorité', PRIORITIES)}
            <FormControlLabel
              disabled={!canEdit}
              control={
                <Checkbox
                  checked={!!student.parental_consent_at}
                  onChange={(e) =>
                    set(
                      'parental_consent_at',
                      e.target.checked ? new Date().toISOString() : null
                    )
                  }
                />
              }
              label={
                student.parental_consent_at
                  ? `Consentement des parents reçu le ${new Date(
                      student.parental_consent_at
                    ).toLocaleDateString('fr-FR')}`
                  : 'Consentement des parents reçu'
              }
            />
            {text('comment', 'Note interne', { multiline: true, minRows: 3 })}
          </Block>
          {canEdit && (
            <Button
              color="error"
              size="small"
              onClick={() => setConfirmDelete(true)}>
              Supprimer cet élève
            </Button>
          )}
        </Grid>
      </Grid>

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>
          Supprimer {student.first_name} {student.last_name} ?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Toutes les informations de cet élève seront supprimées
            définitivement.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Annuler</Button>
          <Button color="error" variant="contained" onClick={remove}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudentPage;
