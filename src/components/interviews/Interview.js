import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import SaveStatus from '../application/SaveStatus';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const EVENT = 'interviews-changed';

// Assessments about what the mission needs, not verdicts on the person: the
// volunteer may read everything recorded about them (RGPD, right of access)
const CHOICES = [
  {
    key: 'recommendation',
    label: 'Recommandation',
    values: ['À retenir', 'Ne pas retenir', 'À revoir'],
  },
  {
    key: 'experience_level',
    label: 'Expérience pédagogique',
    values: ['Confirmée', 'Quelques expériences', 'Débutant(e)'],
  },
  {
    key: 'followup',
    label: "Suivi d'élèves en grande difficulté",
    values: ['Oui', 'Avec accompagnement', 'Pas pour le moment'],
  },
  {
    key: 'test',
    label: 'Maîtrise du français écrit',
    values: ['Vérifiée', 'À vérifier', 'Attestée par les écrits'],
    help: 'Même critère pour tous les candidats (écrits, CV, test)',
  },
  {
    key: 'training',
    label: 'Formations',
    values: ['Requises', 'A proposer', 'Pas nécessaires', 'NSP'],
  },
];
const NOTES = [
  {
    key: 'motivation',
    label:
      "Qu'est-ce qui motive le souhait d'être bénévole ? En particulier dans l'accompagnement aux apprentissages ?",
  },
  {
    key: 'experience',
    label: "Quelle expérience de l'accompagnement aux apprentissages ?",
  },
  {
    key: 'how_tutoring',
    label: 'Comment accompagner un enfant qui rencontre des difficultés ?',
  },
  {
    key: 'personal_questions',
    label:
      "Questions personnalisées (relatives au CV, à un point d'attention, etc.)",
  },
  { key: 'content', label: 'Évaluation détaillée' },
];
export const recommendationColor = (r) =>
  r === 'À retenir'
    ? 'success'
    : r === 'Ne pas retenir'
    ? 'error'
    : r
    ? 'warning'
    : 'default';

// Data that must not be written in an interview report (special categories,
// family life, age…): a reminder, never a block
const SENSITIVE = [
  ['santé', /(malade|maladie|santé|enceinte|grossesse|cancer|dépression|déprim|médica|traitement médical|hospitalis|burn.?out|thérapie)/i],
  ['religion', /(religi|musulman|juif|juive|chrétien|catholique|protestant|bouddhiste|voilée?\b|kippa|ramadan|shabbat|mosquée|église|synagogue)/i],
  ['origine', /(origine|nationalité|étranger|étrangère|immigr|ethni|couleur de peau|accent)/iu],
  ['opinions', /(politique|syndica|militant)/i],
  ['vie familiale', /(divorc|séparée? de|veu(f|ve)|conjoint|\b(ses|sa|son|leurs?)\s+(\S+\s+)?(fils|filles?|garçons|enfants|petits-enfants)\b|nièce|neveu)/iu],
  ['âge', /(^|\D)\d{2}\s?ans\b/i],
];
const sensitiveHint = (text) => {
  const found = SENSITIVE.filter(([, re]) => re.test(text || '')).map(
    ([l]) => l
  );
  return found.length
    ? `À vérifier : ce texte semble mentionner ${found.join(
        ', '
      )}. N'écrivez que ce qui est utile à la mission.`
    : '';
};
const frDate = (d) =>
  d ? new Date(d).toLocaleDateString('fr-FR') : 'sans date';

// Latest recommendation, for the top of the volunteer's page
export const LatestRecommendation = ({ userId }) => {
  const [latest, setLatest] = useState(null);
  useEffect(() => {
    const load = () =>
      axios
        .get(`${BASE_URL}/admin/users/${userId}/interviews`)
        .then(({ data }) =>
          setLatest(data.find((iv) => iv.recommendation) || null)
        )
        .catch(() => setLatest(null));
    load();
    window.addEventListener(EVENT, load);
    return () => window.removeEventListener(EVENT, load);
  }, [userId]);
  if (!latest) return null;
  return (
    <Tooltip
      title={`${latest.title} du ${frDate(latest.date)}${
        latest.by ? `, par ${latest.by}` : ''
      }`}>
      <Chip
        size="small"
        variant="outlined"
        color={recommendationColor(latest.recommendation)}
        label={`Entretien : ${latest.recommendation}`}
      />
    </Tooltip>
  );
};

// One interview: assessment first (quick choices), then the notes. Saved a
// moment after each change, and when it is closed.
const InterviewForm = ({ userId, interview, onSaved, onState }) => {
  const [iv, setIv] = useState(interview);
  const interviewId = `iv-${interview.id}`;
  const pending = useRef({});
  const timer = useRef(null);

  const flush = useCallback(async () => {
    const fields = pending.current;
    pending.current = {};
    if (!Object.keys(fields).length) return;
    onState('saving');
    try {
      const { data } = await axios.patch(
        `${BASE_URL}/admin/users/${userId}/interviews/${interview.id}`,
        fields
      );
      onSaved(data);
      onState(Object.keys(pending.current).length ? 'pending' : 'saved');
      window.dispatchEvent(new Event(EVENT));
    } catch (err) {
      onState(err.sessionExpired ? 'expired' : 'error');
    }
  }, [userId, interview.id, onSaved, onState]);
  useEffect(
    () => () => {
      clearTimeout(timer.current);
      flush();
    },
    [flush]
  );

  const set = (key, value) => {
    setIv((x) => ({ ...x, [key]: value }));
    pending.current = { ...pending.current, [key]: value };
    onState('pending');
    clearTimeout(timer.current);
    timer.current = setTimeout(flush, 700);
  };

  return (
    <Stack spacing={2}>
      <TextField
        size="small"
        type="date"
        label="Date de l'entretien"
        InputLabelProps={{ shrink: true }}
        value={iv.date || ''}
        onChange={(e) => set('date', e.target.value)}
        sx={{ maxWidth: 220 }}
      />

      <Typography variant="subtitle2">Évaluation</Typography>
      <Stack direction="row" flexWrap="wrap" useFlexGap gap={1.5}>
        {CHOICES.map((c) => (
          <FormControl
            key={c.key}
            size="small"
            sx={{ flex: '1 1 220px', minWidth: 0 }}>
            <InputLabel shrink id={`${interviewId}-${c.key}-label`}>
              {c.label}
            </InputLabel>
            <Select
              notched
              labelId={`${interviewId}-${c.key}-label`}
              label={c.label}
              value={iv[c.key] || ''}
              onChange={(e) => set(c.key, e.target.value)}>
              <MenuItem value="">
                <em>Non renseigné</em>
              </MenuItem>
              {c.values.map((v) => (
                <MenuItem key={v} value={v}>
                  {v}
                </MenuItem>
              ))}
            </Select>
            {c.help && <FormHelperText>{c.help}</FormHelperText>}
            {c.key === 'experience_level' && iv.aptitudes && (
              <FormHelperText>
                Ancienne évaluation « aptitudes » : {iv.aptitudes}
              </FormHelperText>
            )}
          </FormControl>
        ))}
      </Stack>
      {!iv.recommendation && (
        <Typography variant="caption" color="text.secondary">
          L'entretien compte comme réalisé dès qu'une recommandation est
          choisie.
        </Typography>
      )}

      <Typography variant="subtitle2">Notes</Typography>
      <Alert severity="info">
        Notez uniquement ce qui est utile à la mission : expérience, pédagogie,
        disponibilités, points d'attention pour le tutorat. Pas d'âge, de
        santé, de religion, d'opinions, d'origine ni de vie familiale. Le
        bénévole peut demander à lire ce compte-rendu.
      </Alert>
      {NOTES.map((n) => (
        // Long questions: shown in full above the field, not cut in its border
        <Box key={n.key}>
          <Typography
            variant="body2"
            component="label"
            htmlFor={`${interviewId}-${n.key}`}
            sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}>
            {n.label}
          </Typography>
          <TextField
            id={`${interviewId}-${n.key}`}
            multiline
            minRows={2}
            fullWidth
            size="small"
            value={iv[n.key] || ''}
            onChange={(e) => set(n.key, e.target.value)}
            helperText={sensitiveHint(iv[n.key])}
            FormHelperTextProps={{ sx: { color: 'warning.dark' } }}
          />
        </Box>
      ))}
    </Stack>
  );
};

// "Entretiens" block of the volunteer's page: one line per interview (latest
// first), the open one below its line
const FormInterviewComponent = ({ userId }) => {
  const [list, setList] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [saveState, setSaveState] = useState('idle');
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/admin/users/${userId}/interviews`)
      .then(({ data }) => setList(data))
      .catch(() => setList([]));
  }, [userId]);

  const onSaved = useCallback(
    (saved) =>
      setList((l) => l.map((x) => (x.id === saved.id ? saved : x))),
    []
  );

  const create = async () => {
    setCreating(true);
    try {
      const { data } = await axios.post(
        `${BASE_URL}/admin/users/${userId}/interviews`
      );
      setList((l) => [data, ...l]);
      setOpenId(data.id);
      window.dispatchEvent(new Event(EVENT));
    } catch {
      toast.error("L'entretien n'a pas pu être créé", {
        position: 'bottom-left',
      });
    } finally {
      setCreating(false);
    }
  };

  const remove = async () => {
    const iv = toDelete;
    setToDelete(null);
    try {
      await axios.delete(
        `${BASE_URL}/admin/users/${userId}/interviews/${iv.id}`
      );
      setList((l) => l.filter((x) => x.id !== iv.id));
      if (openId === iv.id) setOpenId(null);
      window.dispatchEvent(new Event(EVENT));
    } catch {
      toast.error("L'entretien n'a pas pu être supprimé", {
        position: 'bottom-left',
      });
    }
  };

  if (!list) return <LinearProgress sx={{ width: '100%' }} />;
  const done = list.filter((x) => x.recommendation).length;

  return (
    <Box sx={{ width: '100%' }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        useFlexGap
        gap={1}
        sx={{ mb: 1.5 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          {list.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              {done} réalisé{done > 1 ? 's' : ''} sur {list.length}
            </Typography>
          )}
          <SaveStatus state={saveState} />
        </Stack>
        <Button
          size="small"
          variant="contained"
          startIcon={<AddIcon />}
          disabled={creating}
          onClick={create}>
          Nouvel entretien
        </Button>
      </Stack>

      {list.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          Aucun entretien enregistré. Cliquez sur « Nouvel entretien » : la
          date du jour et votre nom sont remplis automatiquement.
        </Typography>
      ) : (
        list.map((iv) => (
          <Accordion
            key={iv.id}
            disableGutters
            expanded={openId === iv.id}
            onChange={(e, open) => setOpenId(open ? iv.id : null)}
            TransitionProps={{ unmountOnExit: true }}
            sx={{
              mb: 1,
              '&:before': { display: 'none' },
              border: 1,
              borderColor: 'divider',
              boxShadow: 'none',
            }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack
                direction="row"
                alignItems="center"
                flexWrap="wrap"
                useFlexGap
                gap={1}
                sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontWeight={600}>{iv.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {frDate(iv.date)}
                  {iv.by ? ` · ${iv.by}` : ''}
                </Typography>
                <Chip
                  size="small"
                  variant={iv.recommendation ? 'filled' : 'outlined'}
                  color={recommendationColor(iv.recommendation)}
                  label={iv.recommendation || 'À compléter'}
                />
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <InterviewForm
                userId={userId}
                interview={iv}
                onSaved={onSaved}
                onState={setSaveState}
              />
              <Button
                size="small"
                color="error"
                startIcon={<DeleteOutlineIcon />}
                sx={{ mt: 2 }}
                onClick={() => setToDelete(iv)}>
                Supprimer cet entretien
              </Button>
            </AccordionDetails>
          </Accordion>
        ))
      )}

      <Dialog open={!!toDelete} onClose={() => setToDelete(null)}>
        <DialogTitle>Supprimer « {toDelete?.title} » ?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            L'entretien du {frDate(toDelete?.date)} et toutes ses notes seront
            supprimés définitivement.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToDelete(null)}>Annuler</Button>
          <Button color="error" variant="contained" onClick={remove}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FormInterviewComponent;
