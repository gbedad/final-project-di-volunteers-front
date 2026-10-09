import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { MODALITIES } from '../../js/studentOptions';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const slotText = (s) => `${s.day} ${s.startTime}–${s.endTime}`;

const Criterion = ({ ok, children }) => (
  <Stack direction="row" spacing={0.5} alignItems="center">
    {ok ? (
      <CheckIcon fontSize="small" color="success" />
    ) : (
      <CloseIcon fontSize="small" color="error" />
    )}
    <Typography variant="body2">{children}</Typography>
  </Stack>
);

// Proposal details, prefilled from what the tutor and the student share
const ProposalForm = ({ student, match, onDone, onBack }) => {
  const [subjects, setSubjects] = useState(
    match.subjects.filter((s) => s.fit).map((s) => s.subject)
  );
  const [slot, setSlot] = useState(match.slots[0] ? 0 : '');
  const [how, setHow] = useState(
    match.place.remote
      ? 'A distance'
      : match.place.sites.length
        ? 'Sur site'
        : student.how_location || ''
  );
  const [site, setSite] = useState(match.place.sites[0] || '');
  const [startDate, setStartDate] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const propose = async () => {
    setSaving(true);
    try {
      await axios.post(`${BASE_URL}/admin/binomes`, {
        student_id: student.id,
        tutor_id: match.tutor.id,
        subjects,
        schedule: slot === '' ? [] : [match.slots[slot]],
        how_location: how || null,
        site: how === 'A distance' ? null : site || null,
        start_date: startDate || null,
        note: note || null,
      });
      toast.success(`Proposition envoyée à ${match.tutor.name}`, {
        position: 'bottom-left',
      });
      onDone();
    } catch (err) {
      toast.error(
        err.response?.data?.error || "La proposition n'a pas pu être envoyée",
        {
          position: 'bottom-left',
        }
      );
      setSaving(false);
    }
  };

  return (
    <>
      <DialogContent>
        <Stack spacing={2}>
          <Typography>
            Proposer à <b>{match.tutor.name}</b> d'accompagner{' '}
            <b>{student.first_name}</b>. Le tuteur reçoit un e-mail et répond
            depuis son espace.
          </Typography>
          {!student.parental_consent_at && (
            <Alert severity="warning">
              L'accord des parents n'a pas encore été reçu. Vous pouvez proposer
              le tuteur, mais le tutorat ne doit pas commencer sans cet accord.
            </Alert>
          )}
          <Box>
            <Typography variant="body2" color="text.secondary">
              Matière(s)
            </Typography>
            {match.subjects.map((s) => (
              <FormControlLabel
                key={s.subject}
                control={
                  <Checkbox
                    checked={subjects.includes(s.subject)}
                    onChange={(e) =>
                      setSubjects(
                        e.target.checked
                          ? [...subjects, s.subject]
                          : subjects.filter((x) => x !== s.subject)
                      )
                    }
                  />
                }
                label={`${s.subject}${s.fit ? '' : ' (hors profil du tuteur)'}`}
              />
            ))}
          </Box>
          <TextField
            select
            size="small"
            label="Créneau"
            value={slot}
            onChange={(e) => setSlot(e.target.value)}>
            {match.slots.map((s, i) => (
              <MenuItem key={i} value={i}>
                {slotText(s)}
              </MenuItem>
            ))}
            <MenuItem value="">À convenir</MenuItem>
          </TextField>
          <Stack direction="row" spacing={1}>
            <TextField
              select
              size="small"
              label="Modalité"
              value={how}
              onChange={(e) => setHow(e.target.value)}
              sx={{ flex: 1 }}>
              {MODALITIES.map((m) => (
                <MenuItem key={m} value={m}>
                  {m}
                </MenuItem>
              ))}
            </TextField>
            {how !== 'A distance' && (
              <TextField
                size="small"
                label="Site"
                value={site}
                onChange={(e) => setSite(e.target.value)}
                sx={{ flex: 1 }}
              />
            )}
          </Stack>
          <TextField
            size="small"
            type="date"
            label="Début souhaité"
            InputLabelProps={{ shrink: true }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <TextField
            size="small"
            label="Message au tuteur (facultatif)"
            multiline
            minRows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <Alert severity="info">
            Le tuteur voit le prénom de l'élève, son niveau, ses besoins et le
            créneau. Il ne reçoit ni les coordonnées des parents ni les besoins
            particuliers.
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onBack}>Retour</Button>
        <Button
          variant="contained"
          disabled={saving || !subjects.length}
          onClick={propose}>
          Envoyer la proposition
        </Button>
      </DialogActions>
    </>
  );
};

// Tutors who fit the student, best first, with the reasons
const MatchDialog = ({ open, student, onClose, onProposed }) => {
  const [scope, setScope] = useState('active');
  const [matches, setMatches] = useState(null);
  const [chosen, setChosen] = useState(null);

  useEffect(() => {
    if (!open) return;
    setMatches(null);
    setChosen(null);
    axios
      .get(`${BASE_URL}/admin/students/${student.id}/matches`, {
        params: { scope },
      })
      .then(({ data }) => setMatches(data))
      .catch(() => setMatches([]));
  }, [open, scope, student.id]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Trouver un tuteur pour {student.first_name}</DialogTitle>
      {chosen ? (
        <ProposalForm
          student={student}
          match={chosen}
          onBack={() => setChosen(null)}
          onDone={() => {
            onProposed();
            onClose();
          }}
        />
      ) : (
        <>
          <DialogContent>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
              gap={1}
              sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Tuteurs qui enseignent au moins une des matières de l'élève à
                son niveau, classés par compatibilité.
              </Typography>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={scope}
                onChange={(e, v) => v && setScope(v)}>
                <ToggleButton value="active">Tuteurs actifs</ToggleButton>
                <ToggleButton value="validated">Tous les validés</ToggleButton>
              </ToggleButtonGroup>
            </Stack>
            {matches === null && <LinearProgress />}
            {matches?.length === 0 && (
              <Alert severity="info">
                Aucun tuteur ne correspond aux matières et au niveau de l'élève.
                Essayez « Tous les validés », ou complétez les profils des
                tuteurs.
              </Alert>
            )}
            <Stack spacing={1.5}>
              {(matches || []).map((m) => (
                <Paper key={m.tutor.id} variant="outlined" sx={{ p: 1.5 }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ width: 64, textAlign: 'center' }}>
                      <Typography variant="h5" color="primary">
                        {m.score}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={m.score}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography fontWeight={600}>{m.tutor.name}</Typography>
                        {!m.tutor.is_active && (
                          <Chip size="small" label="inactif" />
                        )}
                      </Stack>
                      <Stack
                        direction="row"
                        flexWrap="wrap"
                        columnGap={2}
                        rowGap={0.5}
                        sx={{ mt: 0.5 }}>
                        {m.subjects.map((s) => (
                          <Criterion key={s.subject} ok={s.fit}>
                            {s.subject} {student.level}
                          </Criterion>
                        ))}
                        <Criterion ok={m.slots.length > 0}>
                          {m.slots.length
                            ? m.slots
                                .map(
                                  (s) => `${s.day} ${s.startTime}–${s.endTime}`
                                )
                                .join(', ')
                            : 'Aucun créneau commun'}
                        </Criterion>
                        <Criterion ok={m.place.fit}>
                          {m.place.remote
                            ? 'À distance possible'
                            : m.place.sites.length
                              ? m.place.sites.join(', ')
                              : 'Lieu incompatible'}
                        </Criterion>
                        <Criterion ok={m.capacity.free > 0}>
                          {m.capacity.free} place
                          {m.capacity.free > 1 ? 's' : ''} libre
                          {m.capacity.free > 1 ? 's' : ''} sur{' '}
                          {m.capacity.total}
                        </Criterion>
                      </Stack>
                    </Box>
                    <Button variant="outlined" onClick={() => setChosen(m)}>
                      Proposer
                    </Button>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Fermer</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default MatchDialog;
