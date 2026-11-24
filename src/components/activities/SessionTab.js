import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PrintIcon from '@mui/icons-material/Print';
import { ATTENDANCES, BASE_URL, frDate } from './activityUtils';
import { showPhone } from '../../js/phone';

// Preparation and return sessions of an outing (tabs "Préparation" and
// "Retour"): the children who come (not all the registered ones, others may
// join), their presence, and their tutoring sessions that day.
export const SESSION_TEXT = {
  prep: {
    tab: 'Préparation',
    title: 'Séance préparatoire',
    sheet: 'préparation',
    textTitle: 'Compte-rendu de la séance préparatoire',
    textHint:
      "Ce qui a été fait avec les enfants, ce qu'ils ont compris, ce qu'il reste à préparer avant la sortie…",
    printTitle: 'Compte-rendu',
    saveLabel: 'Enregistrer le compte-rendu',
    saved: 'Compte-rendu enregistré',
  },
  debrief: {
    tab: 'Retour',
    title: 'Séance post-activité',
    sheet: 'retour',
    textTitle: 'Retour des enfants sur la sortie',
    textHint:
      "Ce que les enfants ont dit de la sortie, ce qu'ils ont retenu, ce qui a marché, ce qu'il faudrait refaire…",
    printTitle: 'Bilan',
    saveLabel: 'Enregistrer le retour',
    saved: 'Bilan enregistré',
  },
};

const toastError = (err, fallback) =>
  toast.error(err.response?.data?.error || fallback, {
    position: 'bottom-left',
  });
const fullName = (p) => `${p.first_name} ${p.last_name || ''}`.trim();
const timeText = (s) =>
  [s?.start_time, s?.end_time].filter(Boolean).join('–') || '';
const parentOf = (p) => {
  const first = p.parent1_firstname || p.parent1_lastname ? 1 : 2;
  const name = [p[`parent${first}_firstname`], p[`parent${first}_lastname`]]
    .filter(Boolean)
    .join(' ');
  return [name, showPhone(p.parent1_phone || p.parent2_phone)]
    .filter(Boolean)
    .join(' ');
};

// Tutoring sessions of the child that day: red when it overlaps the
// session, orange otherwise (the tutor's name is for the team only)
const ConflictChips = ({ conflicts }) => (
  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
    {(conflicts || []).map((c, i) => {
      const slot = `${c.slot.startTime}–${c.slot.endTime}`;
      const who = c.tutor ? ` avec ${c.tutor}` : '';
      if (c.state === 'prévenu') {
        return (
          <Chip
            key={i}
            size="small"
            color="success"
            variant="outlined"
            label={`Tuteur prévenu · séance ${slot}`}
          />
        );
      }
      if (c.state === 'déjà annulée') {
        return (
          <Chip
            key={i}
            size="small"
            variant="outlined"
            label="Pas de séance de tutorat ce jour-là"
          />
        );
      }
      return (
        <Chip
          key={i}
          size="small"
          color={c.state === 'conflit' ? 'error' : 'warning'}
          label={`Tutorat ${slot}${who}${
            c.state === 'même jour'
              ? ' (même jour)'
              : c.state === 'à vérifier'
                ? ' (horaire à préciser)'
                : ''
          }`}
        />
      );
    })}
  </Stack>
);
const needsTutor = (conflicts) =>
  (conflicts || []).some((c) => ['conflit', 'à vérifier'].includes(c.state));

// Printable list of the children (landscape), only when asked from the tab
const SessionSheet = ({ a, kind, data }) => {
  const s = data.session;
  return (
    <Box className="session-sheet" sx={{ display: 'none', p: 2, fontSize: 12 }}>
      <style>{`
@page { size: A4 landscape; margin: 10mm; }
@media print {
  body[data-print="session"] * { visibility: hidden !important; }
  body[data-print="session"] .session-sheet, body[data-print="session"] .session-sheet * { visibility: visible !important; }
  body[data-print="session"] .session-sheet { position: absolute; left: 0; top: 0; width: 100%; box-sizing: border-box; display: block !important; }
  body[data-print="session"] .activity-sheet { display: none !important; }
  body:not([data-print="session"]) .session-sheet { display: none !important; }
}`}</style>
      <Typography variant="h6">
        {a.title} · {SESSION_TEXT[kind].title}
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {frDate(s.date)} {timeText(s)}
        {s.place ? ` · ${s.place}` : ''}
        {s.by ? ` · Animée par ${s.by}` : ''}
      </Typography>
      <Box
        component="table"
        sx={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 11,
          '& td, & th': {
            border: '1px solid #999',
            p: '3px 5px',
            textAlign: 'left',
            verticalAlign: 'top',
          },
        }}>
        <thead>
          <tr>
            <th>Élève</th>
            <th>Niveau</th>
            <th>Établissement</th>
            <th>Tél. élève</th>
            <th>Parent à appeler</th>
            <th>Tutorat ce jour</th>
            <th>Présent</th>
          </tr>
        </thead>
        <tbody>
          {data.participants.map((p) => (
            <tr key={p.id}>
              <td>{fullName(p)}</td>
              <td>{p.level || ''}</td>
              <td>{p.school_name || ''}</td>
              <td>{showPhone(p.student_phone)}</td>
              <td>{parentOf(p)}</td>
              <td>
                {(p.conflicts || [])
                  .filter((c) =>
                    ['conflit', 'même jour', 'à vérifier'].includes(c.state)
                  )
                  .map((c) => `${c.slot.startTime}–${c.slot.endTime}`)
                  .join(', ')}
              </td>
              <td>☐</td>
            </tr>
          ))}
        </tbody>
      </Box>
      {s.bilan && (
        <>
          <Typography variant="body2" fontWeight={600} sx={{ mt: 1.5 }}>
            {SESSION_TEXT[kind].printTitle}
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {s.bilan}
          </Typography>
        </>
      )}
    </Box>
  );
};

// "Add children": the registered ones not in the session yet, and others
const AddDialog = ({ a, kind, data, onClose, onAdded }) => {
  // The ones present at the outing are ticked for the return session
  const [picked, setPicked] = useState(
    () =>
      new Set(
        kind === 'debrief'
          ? data.candidates
              .filter((c) => c.outing_attendance === 'présent')
              .map((c) => c.student_id)
          : []
      )
  );
  // Children who are not registered to the outing: found in the base
  const [students, setStudents] = useState([]);
  const [extra, setExtra] = useState([]);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    axios
      .get(`${BASE_URL}/admin/activites-eleves`)
      .then(({ data: list }) => setStudents(list))
      .catch(() => setStudents([]));
  }, []);
  const known = new Set([
    ...data.participants.map((p) => p.student_id),
    ...data.candidates.map((c) => c.student_id),
    ...extra.map((e) => e.student_id),
  ]);
  const options = students.filter(
    (s) => !known.has(s.id) && !['Abandon', 'Terminé'].includes(s.status)
  );
  const choose = async (student) => {
    if (!student) return;
    let conflicts = [];
    try {
      const { data: found } = await axios.get(
        `${BASE_URL}/admin/activites/${a.id}/annexes/${kind}/conflits`,
        { params: { student_ids: student.id } }
      );
      conflicts = found[student.id] || [];
    } catch {}
    setExtra((list) => [
      ...list,
      {
        student_id: student.id,
        first_name: student.first_name,
        last_name: student.last_name,
        level: student.level,
        conflicts,
      },
    ]);
    setPicked((set) => new Set(set).add(student.id));
  };
  const toggle = (id) =>
    setPicked((set) => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const rows = [...data.candidates, ...extra];
  const withTutoring = rows.filter(
    (r) => picked.has(r.student_id) && (r.conflicts || []).length
  ).length;
  const add = async () => {
    setBusy(true);
    try {
      const { data: fresh } = await axios.post(
        `${BASE_URL}/admin/activites/${a.id}/annexes/${kind}`,
        { student_ids: [...picked] }
      );
      toast.success(
        `${picked.size} enfant${picked.size > 1 ? 's' : ''} ajouté${picked.size > 1 ? 's' : ''}`,
        { position: 'bottom-left' }
      );
      onAdded(fresh);
    } catch (err) {
      toastError(err, "Les enfants n'ont pas pu être ajoutés");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Ajouter des enfants · {SESSION_TEXT[kind].title}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} sx={{ mt: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            Inscrits à la sortie
            {kind === 'debrief'
              ? ' (les présents à la sortie sont cochés)'
              : ''}
          </Typography>
          {rows.length === 0 && (
            <Typography variant="body2">
              Tous les inscrits sont déjà dans la liste.
            </Typography>
          )}
          {rows.map((r) => (
            <Box key={r.student_id}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={picked.has(r.student_id)}
                    onChange={() => toggle(r.student_id)}
                  />
                }
                label={
                  <Typography variant="body2">
                    {fullName(r)}
                    {r.level ? ` · ${r.level}` : ''}
                    {r.outing_attendance === 'présent'
                      ? ' · présent à la sortie'
                      : ''}
                  </Typography>
                }
              />
              <Box sx={{ pl: 4 }}>
                <ConflictChips conflicts={r.conflicts} />
              </Box>
            </Box>
          ))}
          <Autocomplete
            size="small"
            options={options}
            value={null}
            onChange={(e, v) => choose(v)}
            getOptionLabel={(s) =>
              `${s.first_name} ${s.last_name || ''} · ${s.level || 'niveau ?'}`
            }
            noOptionsText="Aucun élève"
            renderInput={(params) => (
              <TextField
                {...params}
                label="Ajouter un autre enfant"
                placeholder="Prénom ou nom"
              />
            )}
          />
          {withTutoring > 0 && (
            <Alert severity="info">
              {withTutoring} enfant{withTutoring > 1 ? 's ont' : ' a'} du
              tutorat ce jour-là. L'ajout n'est pas bloqué : l'équipe voit le
              cas avec le tuteur.
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          variant="contained"
          disabled={busy || picked.size === 0}
          onClick={add}>
          Ajouter ({picked.size})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const SessionTab = ({ a, kind, canEdit, canTell, onChanged }) => {
  const text = SESSION_TEXT[kind];
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [adding, setAdding] = useState(false);
  // Text of the return session (what came out of it), kept in the session
  const saved = a[kind]?.bilan || '';
  const [bilan, setBilan] = useState(saved);
  const [savingBilan, setSavingBilan] = useState(false);
  useEffect(() => setBilan(saved), [saved]);
  const saveBilan = async () => {
    setSavingBilan(true);
    try {
      await axios.patch(`${BASE_URL}/admin/activites/${a.id}`, {
        [kind]: { ...a[kind], bilan },
      });
      toast.success(text.saved, { position: 'bottom-left' });
      onChanged?.();
    } catch (err) {
      toastError(err, "Le bilan n'a pas pu être enregistré");
    } finally {
      setSavingBilan(false);
    }
  };
  const load = useCallback(() => {
    axios
      .get(`${BASE_URL}/admin/activites/${a.id}/annexes/${kind}`)
      .then(({ data: d }) => setData(d))
      .catch(() => setError(true));
  }, [a.id, kind]);
  useEffect(() => {
    setData(null);
    load();
  }, [load]);

  const patch = async (p, attendance) => {
    try {
      await axios.patch(`${BASE_URL}/admin/annexes/${p.id}`, { attendance });
      setData((d) => ({
        ...d,
        participants: d.participants.map((x) =>
          x.id === p.id ? { ...x, attendance: attendance || null } : x
        ),
      }));
    } catch (err) {
      toastError(err, "La présence n'a pas pu être enregistrée");
    }
  };
  const remove = async (p) => {
    try {
      await axios.delete(`${BASE_URL}/admin/annexes/${p.id}`);
      load();
      onChanged?.();
    } catch (err) {
      toastError(err, "L'enfant n'a pas pu être retiré");
    }
  };
  const tell = async (p) => {
    try {
      const { data: out } = await axios.post(
        `${BASE_URL}/admin/annexes/${p.id}/prevenir`
      );
      toast.success(
        out.told
          ? `Tuteur prévenu pour ${p.first_name}`
          : 'Aucune séance à annuler',
        { position: 'bottom-left' }
      );
      load();
    } catch (err) {
      toastError(err, "Le tuteur n'a pas pu être prévenu");
    }
  };
  const print = () => {
    document.body.setAttribute('data-print', 'session');
    const done = () => {
      document.body.removeAttribute('data-print');
      window.removeEventListener('afterprint', done);
    };
    window.addEventListener('afterprint', done);
    setTimeout(done, 120000);
    window.print();
  };
  const clashes = useMemo(
    () =>
      (data?.participants || []).filter((p) => (p.conflicts || []).length)
        .length,
    [data]
  );

  if (error) {
    return <Alert severity="error">La liste n'a pas pu être chargée.</Alert>;
  }
  if (!data) return <LinearProgress />;
  const s = data.session;
  return (
    <Stack spacing={2}>
      {s && <SessionSheet a={a} kind={kind} data={data} />}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography fontWeight={600}>{text.title}</Typography>
        {s ? (
          <Typography variant="body2" color="text.secondary">
            <Box
              component="span"
              sx={{ '&::first-letter': { textTransform: 'uppercase' } }}>
              {frDate(s.date)}
            </Box>
            {timeText(s) ? ` · ${timeText(s)}` : ''}
            {s.place ? ` · ${s.place}` : ''}
            {s.by ? ` · Animée par ${s.by}` : ''}
          </Typography>
        ) : (
          <Alert severity="info" sx={{ mt: 1 }}>
            Indiquez d'abord la date dans l'onglet Infos.
          </Alert>
        )}
        <Typography variant="caption" color="text.secondary" component="div">
          Date, horaires et lieu se changent dans l'onglet Infos.
        </Typography>
      </Paper>
      {s && (
        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
          alignItems="center">
          {canEdit && (
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => setAdding(true)}>
              Ajouter des enfants
            </Button>
          )}
          <Button
            startIcon={<PrintIcon />}
            disabled={!data.participants.length}
            onClick={print}>
            Feuille de présence · {text.sheet}
          </Button>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ ml: 'auto' }}>
            {data.participants.length} enfant
            {data.participants.length > 1 ? 's' : ''}
            {clashes ? ` · ${clashes} avec du tutorat ce jour-là` : ''}
          </Typography>
        </Stack>
      )}
      {s && data.participants.length === 0 && (
        <Typography color="text.secondary">
          Aucun enfant pour l'instant.
          {canEdit ? ' Utilisez « Ajouter des enfants ».' : ''}
        </Typography>
      )}
      {data.participants.map((p) => (
        <Paper key={p.id} variant="outlined" sx={{ p: 1.5 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems={{ sm: 'center' }}
            justifyContent="space-between">
            <Box sx={{ minWidth: 0 }}>
              <Typography fontWeight={600}>
                {fullName(p)}
                {p.level && (
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.secondary">
                    {' '}
                    · {p.level}
                  </Typography>
                )}
              </Typography>
              <ConflictChips conflicts={p.conflicts} />
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              {canTell && needsTutor(p.conflicts) && (
                <Button size="small" color="warning" onClick={() => tell(p)}>
                  Prévenir le tuteur
                </Button>
              )}
              <TextField
                select
                size="small"
                label="Présence"
                value={p.attendance || ''}
                disabled={!canEdit}
                onChange={(e) => patch(p, e.target.value)}
                sx={{ minWidth: 130 }}>
                <MenuItem value="">—</MenuItem>
                {ATTENDANCES.map((x) => (
                  <MenuItem key={x.value} value={x.value}>
                    {x.label}
                  </MenuItem>
                ))}
              </TextField>
              {canEdit && (
                <IconButton
                  size="small"
                  aria-label="Retirer"
                  title="Retirer de la séance"
                  onClick={() => remove(p)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Stack>
          </Stack>
        </Paper>
      ))}
      {s && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography fontWeight={600} sx={{ mb: 1 }}>
            {text.textTitle}
          </Typography>
          <TextField
            multiline
            minRows={4}
            fullWidth
            size="small"
            placeholder={text.textHint}
            value={bilan}
            onChange={(e) => setBilan(e.target.value)}
            disabled={!canEdit}
            inputProps={{ maxLength: 5000 }}
          />
          {canEdit && (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mt: 1 }}>
              <Button
                variant="contained"
                size="small"
                disabled={bilan === saved || savingBilan}
                onClick={saveBilan}>
                {text.saveLabel}
              </Button>
              {bilan !== saved && (
                <Typography variant="caption" color="warning.main">
                  Pas encore enregistré
                </Typography>
              )}
            </Stack>
          )}
        </Paper>
      )}
      {adding && (
        <AddDialog
          a={a}
          kind={kind}
          data={data}
          onClose={() => setAdding(false)}
          onAdded={(fresh) => {
            setData(fresh);
            setAdding(false);
            onChanged?.();
          }}
        />
      )}
    </Stack>
  );
};

export default SessionTab;
