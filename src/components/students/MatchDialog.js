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
  Tooltip,
  Typography,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { MODALITIES } from '../../js/studentOptions';

import { useSessionState } from '../../js/useSessionState';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const slotText = (s) => `${s.day} ${s.startTime}–${s.endTime}`;

// ok: true (met), false (not met), null (not known)
const Criterion = ({ ok, children }) => (
  <Stack direction="row" spacing={0.5} alignItems="center">
    {ok === null ? (
      <HelpOutlineIcon fontSize="small" color="disabled" />
    ) : ok ? (
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
  // Pairs agreed before MyCogniverse: created active, nothing to accept.
  // Kept for the session, while the existing pairs are entered.
  const [alreadyAccepted, setAlreadyAccepted] = useSessionState(
    'pairs.alreadyAccepted',
    false
  );

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
        already_accepted: alreadyAccepted,
      });
      toast.success(
        alreadyAccepted
          ? `Binôme créé : ${match.tutor.name} accompagne ${student.first_name}`
          : `Proposition envoyée à ${match.tutor.name}`,
        { position: 'bottom-left' }
      );
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
            <b>{student.first_name}</b>.{' '}
            {alreadyAccepted
              ? 'Le binôme est créé directement, sans e-mail ni réponse à attendre.'
              : 'Le tuteur reçoit un e-mail et répond depuis son espace.'}
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
          <FormControlLabel
            control={
              <Checkbox
                checked={alreadyAccepted}
                onChange={(e) => setAlreadyAccepted(e.target.checked)}
              />
            }
            label={
              <Typography variant="body2">
                Le tuteur a déjà accepté (hors application) : créer le binôme
                directement
              </Typography>
            }
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
          {alreadyAccepted ? 'Créer le binôme' : 'Envoyer la proposition'}
        </Button>
      </DialogActions>
    </>
  );
};

// Tutors who fit the student, best first, with the reasons
const MatchDialog = ({ open, student, onClose, onProposed }) => {
  // Demonstration tutors: tests only (a demo student: included at once)
  const [demo, setDemo] = useState(!!student.is_demo);
  const [matches, setMatches] = useState(null);
  const [chosen, setChosen] = useState(null);
  // Full tutor chosen: asked first
  const [fullOne, setFullOne] = useState(null);

  useEffect(() => {
    if (open) setDemo(!!student.is_demo);
  }, [open, student.is_demo]);
  useEffect(() => {
    if (!open) return;
    setMatches(null);
    setChosen(null);
    axios
      .get(`${BASE_URL}/admin/students/${student.id}/matches`, {
        params: { demo: demo ? '1' : '0' },
      })
      .then(({ data }) => setMatches(data))
      .catch(() => setMatches([]));
  }, [open, demo, student.id]);
  const choose = (m) => (m.capacity.free > 0 ? setChosen(m) : setFullOne(m));

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
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Tuteurs validés qui enseignent au moins une des matières de
              l'élève à son niveau : d'abord ceux qui ont de la place, classés
              par compatibilité, puis les tuteurs complets.
            </Typography>
            <FormControlLabel
              sx={{ mt: -1, mb: 1 }}
              control={
                <Checkbox
                  size="small"
                  checked={demo}
                  onChange={(e) => setDemo(e.target.checked)}
                />
              }
              label={
                <Typography variant="body2" color="text.secondary">
                  Inclure les tuteurs de démo (pour tester)
                </Typography>
              }
            />
            {matches === null && <LinearProgress />}
            {matches?.length === 0 && (
              <Alert severity="info">
                Aucun tuteur ne correspond aux matières et au niveau de l'élève.
                Complétez les profils des tuteurs (matières et niveaux), ou
                recrutez un tuteur pour ces matières.
              </Alert>
            )}
            {matches?.length > 0 &&
              !matches.some((m) => m.capacity.free > 0) && (
                <Alert severity="warning" sx={{ mb: 1.5 }}>
                  Tous les tuteurs qui conviennent sont complets : il faut un
                  nouveau tuteur, ou l'accord d'un tuteur pour un élève de plus.
                </Alert>
              )}
            <Stack spacing={1.5}>
              {(matches || []).map((m, i, list) => (
                <React.Fragment key={m.tutor.id}>
                  {/* Full tutors after the others, with a heading */}
                  {m.capacity.free === 0 &&
                    (i === 0 || list[i - 1].capacity.free > 0) && (
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ pt: 1 }}>
                        Tuteurs complets (seulement s'ils acceptent un élève de
                        plus)
                      </Typography>
                    )}
                  <Paper variant="outlined" sx={{ p: 1.5 }}>
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
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          flexWrap="wrap"
                          useFlexGap>
                          <Typography fontWeight={600}>
                            {m.tutor.name}
                          </Typography>
                          {/* Where the tutor stands: new, or students now and before */}
                          {m.experience.current + m.experience.past === 0 ? (
                            <Chip
                              size="small"
                              color="success"
                              label="Nouveau"
                            />
                          ) : (
                            <Chip
                              size="small"
                              variant="outlined"
                              label={[
                                m.experience.current > 0 &&
                                  `${m.experience.current} élève${m.experience.current > 1 ? 's' : ''} en cours`,
                                m.experience.past > 0 &&
                                  `${m.experience.past} suivi${m.experience.past > 1 ? 's' : ''} avant`,
                              ]
                                .filter(Boolean)
                                .join(' · ')}
                            />
                          )}
                          {m.tutor.is_demo && (
                            <Chip size="small" label="Démo" />
                          )}
                          {m.capacity.free === 0 && (
                            <Chip
                              size="small"
                              color="error"
                              variant="outlined"
                              label={`Complet (${m.capacity.used} élève${m.capacity.used > 1 ? 's' : ''} sur ${m.capacity.total})`}
                            />
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
                                    (s) =>
                                      `${s.day} ${s.startTime}–${s.endTime}`
                                  )
                                  .join(', ')
                              : 'Aucun créneau commun'}
                          </Criterion>
                          {m.busy?.length > 0 && (
                            <Typography
                              variant="caption"
                              color="text.secondary">
                              Déjà pris :{' '}
                              {m.busy
                                .map(
                                  (s) => `${s.day} ${s.startTime}–${s.endTime}`
                                )
                                .join(', ')}
                            </Typography>
                          )}
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
                          {m.difficulty && (
                            <Tooltip title="L'élève a des besoins particuliers : critère tiré du dernier entretien du tuteur (jusqu'à 5 points ; valeur neutre de 2,5 points s'il n'a pas été évalué)">
                              <span>
                                <Criterion
                                  ok={
                                    m.difficulty.followup
                                      ? m.difficulty.points > 0
                                      : null
                                  }>
                                  {m.difficulty.followup
                                    ? `Élèves en grande difficulté : ${m.difficulty.followup.toLowerCase()}`
                                    : 'Élèves en grande difficulté : non évalué en entretien'}
                                </Criterion>
                              </span>
                            </Tooltip>
                          )}
                        </Stack>
                      </Box>
                      <Button variant="outlined" onClick={() => choose(m)}>
                        Proposer
                      </Button>
                    </Stack>
                  </Paper>
                </React.Fragment>
              ))}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Fermer</Button>
          </DialogActions>
        </>
      )}
      <Dialog open={!!fullOne} onClose={() => setFullOne(null)} maxWidth="xs">
        <DialogTitle>Tuteur complet</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {fullOne?.tutor.name} a indiqué {fullOne?.capacity.total} élève
            {fullOne?.capacity.total > 1 ? 's' : ''} au maximum et en accompagne
            déjà {fullOne?.capacity.used}. Le proposer quand même ? (à faire
            seulement s'il a accepté un élève de plus)
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFullOne(null)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={() => {
              setChosen(fullOne);
              setFullOne(null);
            }}>
            Proposer quand même
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default MatchDialog;
