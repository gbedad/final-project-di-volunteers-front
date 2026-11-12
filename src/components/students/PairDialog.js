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
  Checkbox,
  FormControlLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { SessionList, formatHours } from './Sessions';
import SlotsEditor from './SlotsEditor';
import ConfirmSession from './ConfirmSession';
import { isManager } from '../../js/roles';
import { MODALITIES } from '../../js/studentOptions';
import { BreaksList, NoSessionDialog } from '../application/PairChanges';

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
const DetailsEditor = ({ pair, request, onSaved, onCancel }) => {
  // request: the slot told by the tutor, to apply
  const [schedule, setSchedule] = useState(
    request?.schedule || pair.schedule || []
  );
  const [duringHolidays, setDuringHolidays] = useState(!!pair.during_holidays);
  const [how, setHow] = useState(pair.how_location || '');
  const [site, setSite] = useState(pair.site || '');
  // The new slot applies from that day; or it corrects the whole past (the
  // slot was wrong from the start)
  const [since, setSince] = useState(
    request?.since ||
      new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' })
  );
  const [fromStart, setFromStart] = useState(false);
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    try {
      const { data } = await axios.patch(
        `${BASE_URL}/admin/binomes/${pair.id}/details`,
        {
          schedule,
          how_location: how,
          site,
          since: fromStart ? null : since,
          during_holidays: duringHolidays,
        }
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
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          alignItems={{ sm: 'center' }}>
          <TextField
            size="small"
            type="date"
            label="Applicable à partir du"
            value={since}
            disabled={fromStart}
            onChange={(e) => setSince(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={fromStart}
                onChange={(e) => setFromStart(e.target.checked)}
              />
            }
            label={
              <Typography variant="body2">
                Corriger depuis le début du binôme (le créneau était faux)
              </Typography>
            }
          />
        </Stack>
        {fromStart && (pair.schedule_history || []).length > 1 ? (
          <Alert severity="warning">
            Ceci efface l'historique des créneaux : toutes les séances, même
            anciennes, seront jugées sur ce créneau. Pour ajouter ou changer un
            créneau sans toucher au passé, décochez et choisissez une date.
          </Alert>
        ) : (
          <Typography variant="caption" color="text.secondary">
            Les séances avant cette date gardent l'ancien créneau (créneau
            prévu, retards).
          </Typography>
        )}
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
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={duringHolidays}
              onChange={(e) => setDuringHolidays(e.target.checked)}
            />
          }
          label={
            <Typography variant="body2">
              Séances aussi pendant les vacances scolaires (attendues dans le
              journal)
            </Typography>
          }
        />
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
  const [confirming, setConfirming] = useState(false);
  // Applying the slot told by the tutor
  const [applying, setApplying] = useState(false);
  const [breaks, setBreaks] = useState([]);
  const [noSession, setNoSession] = useState(false);
  const manager = isManager(currentRole());
  // Another pair opened (the student's page passes a new object each time:
  // only the id counts)
  const initialId = initial?.id;
  useEffect(() => {
    setPair(initial);
    setEditing(false);
    setApplying(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialId]);

  const pairId = pair?.id;
  const load = useCallback(() => {
    if (!pairId) return;
    axios
      .get(`${BASE_URL}/admin/binomes/${pairId}/seances`)
      .then(({ data }) => setData(data))
      .catch(() => setData({ sessions: [], stats: null }));
    axios
      .get(`${BASE_URL}/admin/binomes/${pairId}/pas-de-seance`)
      .then(({ data }) => setBreaks(data))
      .catch(() => setBreaks([]));
  }, [pairId]);
  const dismissRequest = async () => {
    try {
      const { data } = await axios.patch(
        `${BASE_URL}/admin/binomes/${pair.id}/details`,
        { schedule_request: null }
      );
      setPair({ ...pair, ...data });
      onChanged?.();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Enregistrement impossible', {
        position: 'bottom-left',
      });
    }
  };
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
        {/* Earlier slots (each change applies from a day) */}
        {(pair.schedule_history || []).length > 1 && (
          <Typography variant="caption" color="text.secondary" component="div">
            {[...pair.schedule_history]
              .sort((a, b) =>
                String(a.since || '').localeCompare(String(b.since || ''))
              )
              .slice(0, -1)
              .map((h) => {
                const next = pair.schedule_history
                  .map((x) => x.since)
                  .filter((d) => d && d > (h.since || ''))
                  .sort()[0];
                return `Avant le ${new Date(`${next}T12:00:00Z`).toLocaleDateString('fr-FR')} : ${
                  (h.schedule || [])
                    .map((s) => `${s.day} ${s.startTime}–${s.endTime}`)
                    .join(', ') || 'aucun créneau'
                }`;
              })
              .join(' · ')}
          </Typography>
        )}
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
            {pair.schedule_request?.schedule?.length > 0 && !editing && (
              <Alert
                severity="info"
                action={
                  manager && (
                    <Stack direction={{ xs: 'column', sm: 'row' }}>
                      <Button
                        size="small"
                        onClick={() => {
                          setApplying(true);
                          setEditing(true);
                        }}>
                        Appliquer
                      </Button>
                      <Button
                        size="small"
                        color="inherit"
                        onClick={dismissRequest}>
                        Écarter
                      </Button>
                    </Stack>
                  )
                }>
                Nouveau créneau signalé par le tuteur le{' '}
                {formatDate(pair.schedule_request.at)} :{' '}
                <b>
                  {pair.schedule_request.schedule
                    .map((x) => `${x.day} ${x.startTime}–${x.endTime}`)
                    .join(', ')}
                </b>
                {pair.schedule_request.since
                  ? ` à partir du ${formatDate(`${pair.schedule_request.since}T12:00:00Z`)}`
                  : ''}
                {pair.schedule_request.note
                  ? ` · « ${pair.schedule_request.note} »`
                  : ''}
              </Alert>
            )}
            {editing ? (
              <DetailsEditor
                pair={pair}
                request={applying ? pair.schedule_request : null}
                onCancel={() => {
                  setEditing(false);
                  setApplying(false);
                }}
                onSaved={(saved) => {
                  setPair({ ...pair, ...saved });
                  setEditing(false);
                  setApplying(false);
                  onChanged?.();
                }}
              />
            ) : (
              manager && (
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  <Button size="small" onClick={() => setEditing(true)}>
                    Modifier le créneau, la modalité ou le lieu
                  </Button>
                  <Button size="small" onClick={() => setConfirming(true)}>
                    Ajouter une séance confirmée
                  </Button>
                  {['actif', 'en pause'].includes(pair.status) && (
                    <Button size="small" onClick={() => setNoSession(true)}>
                      Pas de séance (prévenu)
                    </Button>
                  )}
                </Stack>
              )
            )}
            {pair.during_holidays && (
              <Typography variant="body2" color="text.secondary">
                Ce binôme continue pendant les vacances scolaires.
              </Typography>
            )}
            <BreaksList
              breaks={breaks}
              deleteUrl={(id) => `${BASE_URL}/admin/pas-de-seance/${id}`}
              onChanged={load}
            />
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
      {noSession && (
        <NoSessionDialog
          open
          url={`${BASE_URL}/admin/binomes/${pair.id}/pas-de-seance`}
          firstName={pair.student?.first_name}
          onClose={() => setNoSession(false)}
          onSaved={() => {
            setNoSession(false);
            load();
            onChanged?.();
          }}
        />
      )}
      <ConfirmSession
        open={confirming}
        pair={pair}
        onClose={() => setConfirming(false)}
        onSaved={() => {
          load();
          onChanged?.();
        }}
      />
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
