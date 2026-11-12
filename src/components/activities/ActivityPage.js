import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
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
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PrintIcon from '@mui/icons-material/Print';
import TimeInput from '../TimeInput';
import FlyerDialog from './Flyer';
import ImageIcon from '@mui/icons-material/Image';
import { LEVELS } from '../../js/volunteerSearch';
import { isCulture } from '../../js/roles';
import {
  ACTIVITY_STATUSES,
  BASE_URL,
  EDITABLE_STATUSES,
  KINDS,
  PAYMENT_METHODS,
  euros,
  familyMessage,
  frDate,
  hours,
  resizeImage,
  today,
} from './activityUtils';

const toastError = (err, text) =>
  toast.error(err.response?.data?.error || text, { position: 'bottom-left' });
const copy = async (text, done) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(done, { position: 'bottom-left' });
  } catch {
    toast.error('Copie impossible', { position: 'bottom-left' });
  }
};
const fullName = (r) => `${r.first_name} ${r.last_name || ''}`.trim();
const PRINT_CSS = `
@media print {
  body * { visibility: hidden !important; }
  .activity-sheet, .activity-sheet * { visibility: visible !important; }
  .activity-sheet { position: absolute; left: 0; top: 0; width: 100%; display: block !important; }
}`;

// ---- Infos ----
const InfoTab = ({ a, canEdit, onSaved, onDeleted }) => {
  const [form, setForm] = useState(a);
  const [busy, setBusy] = useState(false);
  useEffect(() => setForm(a), [a]);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const save = async () => {
    setBusy(true);
    try {
      const { data } = await axios.patch(
        `${BASE_URL}/admin/activites/${a.id}`,
        {
          title: form.title,
          kind: form.kind,
          status: form.status,
          date: form.date,
          start_time: form.start_time,
          end_time: form.end_time,
          place: form.place,
          meeting_point: form.meeting_point,
          levels: form.levels,
          places: form.places,
          deadline: form.deadline,
          fee: form.fee,
          adults_per_students: form.adults_per_students,
          description: form.description,
          image: form.image,
        }
      );
      toast.success('Activité enregistrée', { position: 'bottom-left' });
      onSaved(data);
    } catch (err) {
      toastError(err, "L'activité n'a pas pu être enregistrée");
    } finally {
      setBusy(false);
    }
  };
  const pickImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const image = await resizeImage(file);
      setForm((f) => ({ ...f, image }));
    } catch {
      toast.error('Image illisible', { position: 'bottom-left' });
    }
  };
  const remove = async () => {
    try {
      await axios.delete(`${BASE_URL}/admin/activites/${a.id}`);
      onDeleted();
    } catch (err) {
      toastError(err, "L'activité n'a pas pu être supprimée");
    }
  };
  const [confirmDelete, setConfirmDelete] = useState(false);
  const grid = {
    display: 'grid',
    gap: 2,
    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
  };
  return (
    <Stack spacing={2}>
      <Box sx={grid}>
        <TextField
          size="small"
          label="Titre"
          value={form.title || ''}
          onChange={set('title')}
          disabled={!canEdit}
          sx={{ gridColumn: { sm: '1 / -1' } }}
        />
        <TextField
          select
          size="small"
          label="Type"
          value={form.kind || ''}
          onChange={set('kind')}
          disabled={!canEdit}>
          <MenuItem value="">—</MenuItem>
          {KINDS.map((k) => (
            <MenuItem key={k} value={k}>
              {k}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Statut"
          value={form.status}
          onChange={set('status')}
          disabled={!canEdit}>
          {EDITABLE_STATUSES.map((s) => (
            <MenuItem key={s} value={s}>
              {ACTIVITY_STATUSES[s].label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          type="date"
          label="Date"
          value={form.date || ''}
          onChange={set('date')}
          InputLabelProps={{ shrink: true }}
          disabled={!canEdit}
        />
        <Stack direction="row" spacing={1}>
          <TimeInput
            label="Début"
            value={form.start_time || ''}
            onChange={(t) => setForm((f) => ({ ...f, start_time: t }))}
            options={undefined}
            sx={{ flex: 1 }}
            disabled={!canEdit}
          />
          <TimeInput
            label="Fin"
            value={form.end_time || ''}
            after={form.start_time}
            onChange={(t) => setForm((f) => ({ ...f, end_time: t }))}
            sx={{ flex: 1 }}
            disabled={!canEdit}
          />
        </Stack>
        <TextField
          size="small"
          label="Lieu"
          value={form.place || ''}
          onChange={set('place')}
          disabled={!canEdit}
        />
        <TextField
          size="small"
          label="Point de rendez-vous"
          value={form.meeting_point || ''}
          onChange={set('meeting_point')}
          disabled={!canEdit}
        />
        <TextField
          size="small"
          type="number"
          label="Places (élèves)"
          value={form.places ?? ''}
          onChange={set('places')}
          inputProps={{ min: 1 }}
          disabled={!canEdit}
        />
        <TextField
          size="small"
          type="date"
          label="Inscriptions jusqu'au"
          value={form.deadline || ''}
          onChange={set('deadline')}
          InputLabelProps={{ shrink: true }}
          disabled={!canEdit}
        />
        <TextField
          size="small"
          type="number"
          label="Participation par élève (€)"
          value={form.fee ?? 0}
          onChange={set('fee')}
          inputProps={{ min: 0, step: 0.5 }}
          helperText="0 : gratuit pour les familles"
          disabled={!canEdit}
        />
        <TextField
          size="small"
          type="number"
          label="Un adulte pour … élèves"
          value={form.adults_per_students ?? 8}
          onChange={set('adults_per_students')}
          inputProps={{ min: 1 }}
          disabled={!canEdit}
        />
        <Autocomplete
          multiple
          size="small"
          options={LEVELS}
          value={form.levels || []}
          onChange={(e, v) => setForm((f) => ({ ...f, levels: v }))}
          disabled={!canEdit}
          sx={{ gridColumn: { sm: '1 / -1' } }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Niveaux conseillés"
              placeholder="Tous niveaux si vide"
            />
          )}
        />
        <TextField
          size="small"
          label="Description"
          value={form.description || ''}
          onChange={set('description')}
          multiline
          minRows={4}
          disabled={!canEdit}
          sx={{ gridColumn: { sm: '1 / -1' } }}
        />
      </Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ sm: 'center' }}>
        {form.image && (
          <Box
            component="img"
            src={form.image}
            alt=""
            sx={{ width: 200, maxWidth: '100%', borderRadius: 1 }}
          />
        )}
        {canEdit && (
          <Stack direction="row" spacing={1}>
            <Button component="label" size="small" variant="outlined">
              {form.image ? "Changer l'image" : 'Ajouter une image'}
              <input hidden type="file" accept="image/*" onChange={pickImage} />
            </Button>
            {form.image && (
              <Button
                size="small"
                color="inherit"
                onClick={() => setForm((f) => ({ ...f, image: null }))}>
                Retirer
              </Button>
            )}
          </Stack>
        )}
      </Stack>
      {canEdit && (
        <Stack
          direction="row"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={1}>
          <Button color="error" onClick={() => setConfirmDelete(true)}>
            Supprimer l'activité
          </Button>
          <Button variant="contained" disabled={busy} onClick={save}>
            Enregistrer
          </Button>
        </Stack>
      )}
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Supprimer « {a.title} » ?</DialogTitle>
        <DialogContent>
          <Typography>
            Les inscriptions ({a.registrations.length}) et les accompagnateurs
            sont supprimés aussi. Pour une sortie qui n'aura pas lieu, préférez
            le statut « Annulée ».
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Garder</Button>
          <Button color="error" variant="contained" onClick={remove}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

// ---- Registrations ----
const PaymentDialog = ({ r, onClose, onSaved }) => {
  const [form, setForm] = useState({
    fee_override: r.fee_override ?? '',
    paid_amount: r.paid_amount ?? r.due,
    paid_method: r.paid_method || 'espèces',
    paid_at: r.paid_at || today(),
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const save = async (clear) => {
    try {
      await axios.patch(
        `${BASE_URL}/admin/inscriptions-activites/${r.id}`,
        clear
          ? { paid_amount: null, paid_method: null, paid_at: null }
          : {
              ...form,
              fee_override: form.fee_override === '' ? null : form.fee_override,
            }
      );
      onSaved();
    } catch (err) {
      toastError(err, "Le paiement n'a pas pu être enregistré");
    }
  };
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Participation de {fullName(r)}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            size="small"
            type="number"
            label="Montant dû (exception)"
            value={form.fee_override}
            onChange={set('fee_override')}
            helperText="Vide : la participation de l'activité"
            inputProps={{ min: 0, step: 0.5 }}
          />
          <TextField
            size="small"
            type="number"
            label="Montant payé (€)"
            value={form.paid_amount ?? ''}
            onChange={set('paid_amount')}
            inputProps={{ min: 0, step: 0.5 }}
          />
          <TextField
            select
            size="small"
            label="Moyen"
            value={form.paid_method}
            onChange={set('paid_method')}>
            {PAYMENT_METHODS.map((m) => (
              <MenuItem key={m.value} value={m.value}>
                {m.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            type="date"
            label="Payé le"
            value={form.paid_at}
            onChange={set('paid_at')}
            InputLabelProps={{ shrink: true }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        {r.paid_amount !== null && (
          <Button color="inherit" onClick={() => save(true)}>
            Effacer le paiement
          </Button>
        )}
        <Button onClick={onClose}>Annuler</Button>
        <Button variant="contained" onClick={() => save(false)}>
          Enregistrer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Tutoring session at the time of the outing: told or to tell the tutor
const sessionText = (c) =>
  `Séance de tutorat ${c.slot.startTime}–${c.slot.endTime}${
    c.subjects?.length ? ` (${c.subjects.join(', ')})` : ''
  }${c.tutor ? ` avec ${c.tutor}` : ''}`;
const TutoringNotice = ({ r, canEdit, onChanged }) => {
  const [busy, setBusy] = useState(false);
  const open = r.tutoring.filter((c) =>
    ['conflit', 'à vérifier'].includes(c.state)
  );
  const tell = async () => {
    setBusy(true);
    try {
      const { data } = await axios.post(
        `${BASE_URL}/admin/inscriptions-activites/${r.id}/prevenir`
      );
      toast.success(
        data.told
          ? 'Tuteur prévenu : séance annulée ce jour-là'
          : 'Rien à prévenir',
        { position: 'bottom-left' }
      );
      onChanged();
    } catch (err) {
      toastError(err, "Le tuteur n'a pas pu être prévenu");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Stack spacing={0.5} sx={{ mt: 0.75 }}>
      {r.tutoring.map((c) => (
        <Chip
          key={c.pair_id}
          size="small"
          sx={{
            alignSelf: 'flex-start',
            height: 'auto',
            py: 0.25,
            '& .MuiChip-label': { whiteSpace: 'normal' },
          }}
          color={
            ['conflit', 'à vérifier'].includes(c.state) ? 'warning' : 'default'
          }
          variant={c.state === 'conflit' ? 'filled' : 'outlined'}
          label={`${sessionText(c)} · ${
            {
              conflit: 'en même temps que la sortie',
              'à vérifier': 'à vérifier (sortie sans heures)',
              prévenu: 'tuteur prévenu',
              'déjà annulée': 'déjà annulée',
            }[c.state]
          }`}
        />
      ))}
      {canEdit && open.length > 0 && (
        <Button
          size="small"
          sx={{ alignSelf: 'flex-start' }}
          disabled={busy}
          onClick={tell}>
          Prévenir le tuteur (séance annulée ce jour-là)
        </Button>
      )}
    </Stack>
  );
};

const RegistrationRow = ({ r, a, canEdit, onChanged, onPay, placeFree }) => {
  const [menu, setMenu] = useState(null);
  const patch = async (body) => {
    try {
      await axios.patch(
        `${BASE_URL}/admin/inscriptions-activites/${r.id}`,
        body
      );
      onChanged();
    } catch (err) {
      toastError(err, "L'inscription n'a pas pu être modifiée");
    }
  };
  const remove = async () => {
    try {
      await axios.delete(`${BASE_URL}/admin/inscriptions-activites/${r.id}`);
      onChanged();
    } catch (err) {
      toastError(err, "L'inscription n'a pas pu être supprimée");
    }
  };
  const paid = r.paid_amount !== null && r.paid_amount !== undefined;
  const owes = r.status === 'inscrit' && r.due > 0;
  return (
    <Paper
      variant="outlined"
      sx={{ p: 1.5, opacity: r.status === 'désisté' ? 0.6 : 1 }}>
      <Stack direction="row" alignItems="flex-start" spacing={1}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap>
            <Typography fontWeight={600}>{fullName(r)}</Typography>
            <Typography variant="body2" color="text.secondary">
              {r.level || ''}
            </Typography>
            {r.status === 'attente' && (
              <Chip size="small" color="warning" label="Liste d'attente" />
            )}
            {r.status === 'désisté' && <Chip size="small" label="Désisté" />}
            {r.is_demo && <Chip size="small" label="Démo" />}
          </Stack>
          {r.status === 'inscrit' && (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
              sx={{ mt: 0.5 }}>
              <FormControlLabel
                sx={{ mr: 1 }}
                control={
                  <Checkbox
                    size="small"
                    checked={!!r.consent_at}
                    disabled={!canEdit}
                    onChange={(e) =>
                      patch({ consent_at: e.target.checked ? today() : null })
                    }
                  />
                }
                label={
                  <Typography variant="body2">
                    Autorisation de sortie
                  </Typography>
                }
              />
              {owes || paid ? (
                <Chip
                  size="small"
                  variant={paid ? 'filled' : 'outlined'}
                  color={
                    paid && Number(r.paid_amount) >= r.due
                      ? 'success'
                      : 'warning'
                  }
                  label={
                    paid
                      ? `Payé ${euros(r.paid_amount)}`
                      : `À payer ${euros(r.due)}`
                  }
                  onClick={canEdit ? onPay : undefined}
                />
              ) : (
                <Chip
                  size="small"
                  variant="outlined"
                  label="Gratuit"
                  onClick={canEdit ? onPay : undefined}
                />
              )}
              {r.attendance && (
                <Chip
                  size="small"
                  color={r.attendance === 'présent' ? 'success' : 'error'}
                  label={`${r.attendance === 'présent' ? 'Présent' : 'Absent'}${r.attendance_by ? ` (${r.attendance_by})` : ''}`}
                />
              )}
            </Stack>
          )}
          {r.status === 'inscrit' && (r.tutoring || []).length > 0 && (
            <TutoringNotice r={r} canEdit={canEdit} onChanged={onChanged} />
          )}
          {r.status === 'attente' && canEdit && placeFree && (
            <Button
              size="small"
              sx={{ mt: 0.5 }}
              onClick={() => patch({ status: 'inscrit' })}>
              Lui donner la place libre
            </Button>
          )}
        </Box>
        {canEdit && (
          <IconButton
            size="small"
            aria-label="Actions"
            onClick={(e) => setMenu(e.currentTarget)}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        )}
        <Menu anchorEl={menu} open={!!menu} onClose={() => setMenu(null)}>
          {r.status !== 'inscrit' && (
            <MenuItem
              onClick={() => {
                setMenu(null);
                patch({ status: 'inscrit' });
              }}>
              Inscrire
            </MenuItem>
          )}
          {r.status === 'inscrit' && (
            <MenuItem
              onClick={() => {
                setMenu(null);
                onPay();
              }}>
              Participation et paiement
            </MenuItem>
          )}
          {r.status === 'inscrit' &&
            a.date &&
            a.date <= today() && [
              <MenuItem
                key="p"
                onClick={() => {
                  setMenu(null);
                  patch({ attendance: 'présent' });
                }}>
                Présent
              </MenuItem>,
              <MenuItem
                key="a"
                onClick={() => {
                  setMenu(null);
                  patch({ attendance: 'absent' });
                }}>
                Absent
              </MenuItem>,
            ]}
          {r.status !== 'désisté' && (
            <MenuItem
              onClick={() => {
                setMenu(null);
                patch({ status: 'désisté' });
              }}>
              Se désiste
            </MenuItem>
          )}
          <MenuItem
            onClick={() => {
              setMenu(null);
              remove();
            }}
            sx={{ color: 'error.main' }}>
            Supprimer l'inscription
          </MenuItem>
        </Menu>
      </Stack>
    </Paper>
  );
};

// A student of the outings only, not in the base yet
const NewStudentDialog = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    level: '',
    parent1_firstname: '',
    parent1_phone: '',
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const save = async () => {
    setBusy(true);
    try {
      const { data } = await axios.post(
        `${BASE_URL}/admin/activites-eleves`,
        form
      );
      onCreated(data);
    } catch (err) {
      toastError(err, "L'élève n'a pas pu être créé");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Nouvel élève (sorties seulement)</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            size="small"
            label="Prénom"
            value={form.first_name}
            onChange={set('first_name')}
          />
          <TextField
            size="small"
            label="Nom"
            value={form.last_name}
            onChange={set('last_name')}
          />
          <TextField
            select
            size="small"
            label="Niveau"
            value={form.level}
            onChange={set('level')}>
            <MenuItem value="">—</MenuItem>
            {LEVELS.map((l) => (
              <MenuItem key={l} value={l}>
                {l}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            label="Prénom du parent"
            value={form.parent1_firstname}
            onChange={set('parent1_firstname')}
          />
          <TextField
            size="small"
            label="Téléphone du parent"
            value={form.parent1_phone}
            onChange={set('parent1_phone')}
          />
          <Typography variant="caption" color="text.secondary">
            Créé avec le statut « Activités culturelles seulement », puis
            inscrit à cette activité. L'équipe pourra compléter sa fiche.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          variant="contained"
          disabled={busy || !form.first_name.trim() || !form.last_name.trim()}
          onClick={save}>
          Créer et inscrire
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const RegistrationsTab = ({ a, canEdit, reload }) => {
  const [students, setStudents] = useState([]);
  const [picked, setPicked] = useState(null);
  const [paying, setPaying] = useState(null);
  const [newStudent, setNewStudent] = useState(false);
  // A tutoring session at the time of the outing: what to do
  const [clash, setClash] = useState(null);
  useEffect(() => {
    if (!canEdit) return;
    axios
      .get(`${BASE_URL}/admin/activites-eleves`)
      .then(({ data }) => setStudents(data))
      .catch(() => setStudents([]));
  }, [canEdit]);
  const taken = new Set(
    a.registrations
      .filter((r) => r.status !== 'désisté')
      .map((r) => r.student_id)
  );
  // Students of the advised levels first, then by first name
  const options = useMemo(() => {
    const fits = (s) => !a.levels?.length || a.levels.includes(s.level);
    return students
      .filter(
        (s) => !taken.has(s.id) && !['Abandon', 'Terminé'].includes(s.status)
      )
      .sort(
        (x, y) =>
          Number(fits(y)) - Number(fits(x)) ||
          String(x.first_name).localeCompare(String(y.first_name), 'fr')
      )
      .map((s) => ({
        ...s,
        group: fits(s)
          ? a.levels?.length
            ? 'Niveaux conseillés'
            : 'Élèves'
          : 'Autres niveaux',
      }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students, a.registrations, a.levels]);
  // Registered, telling the tutor (or not) when a session is at that time
  const save = async (student, tellTutor) => {
    try {
      const { data } = await axios.post(
        `${BASE_URL}/admin/activites/${a.id}/inscriptions`,
        { student_id: student.id, tell_tutor: tellTutor }
      );
      toast.success(
        data.status === 'attente'
          ? `${student.first_name} est sur liste d'attente (activité complète)`
          : `${student.first_name} est inscrit(e)${
              data.tutors_told ? ', tuteur prévenu' : ''
            }`,
        { position: 'bottom-left' }
      );
      setPicked(null);
      setClash(null);
      reload();
    } catch (err) {
      toastError(err, "L'inscription n'a pas pu être enregistrée");
    }
  };
  const add = async (student) => {
    if (!student) return;
    let found = [];
    try {
      ({ data: found } = await axios.get(
        `${BASE_URL}/admin/activites/${a.id}/conflits`,
        { params: { student_id: student.id } }
      ));
    } catch {}
    if (found.length) setClash({ student, found });
    else save(student, false);
  };
  const registered = a.registrations.filter((r) => r.status === 'inscrit');
  const waiting = a.registrations.filter((r) => r.status === 'attente');
  const left = a.registrations.filter((r) => r.status === 'désisté');
  const placeFree = !a.places || registered.length < a.places;
  const noConsent = registered.filter((r) => !r.consent_at).length;
  return (
    <Stack spacing={2}>
      {canEdit && (
        <Autocomplete
          size="small"
          options={options}
          groupBy={(o) => o.group}
          value={picked}
          onChange={(e, v) => add(v)}
          getOptionLabel={(s) =>
            `${s.first_name} ${s.last_name || ''} · ${s.level || 'niveau ?'}`
          }
          isOptionEqualToValue={(o, v) => o.id === v.id}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Inscrire un élève"
              placeholder="Prénom ou nom"
            />
          )}
        />
      )}
      {canEdit && (
        <Button
          size="small"
          sx={{ alignSelf: 'flex-start', mt: -1 }}
          onClick={() => setNewStudent(true)}>
          Élève absent de la liste ? Le créer
        </Button>
      )}
      {clash && (
        <Dialog open onClose={() => setClash(null)} fullWidth maxWidth="xs">
          <DialogTitle>Séance de tutorat ce jour-là</DialogTitle>
          <DialogContent>
            <Stack spacing={1}>
              {clash.found.map((c) => (
                <Typography key={c.pair_id}>
                  {frDate(a.date).replace(/^./, (c) => c.toUpperCase())},{' '}
                  {clash.student.first_name} a une{' '}
                  {sessionText(c).charAt(0).toLowerCase() +
                    sessionText(c).slice(1)}
                  .{' '}
                  {c.state === 'conflit'
                    ? `Elle chevauche la sortie (${hours(a)}, trajet compris).`
                    : "La sortie n'a pas encore d'heures : à vérifier."}
                </Typography>
              ))}
              <Typography variant="body2" color="text.secondary">
                Prévenir le tuteur annule la séance ce jour-là (« Pas de séance
                », motif : élève indisponible) et lui envoie un e-mail. Si
                l'élève se désiste, la séance est rétablie et le tuteur prévenu.
              </Typography>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ flexWrap: 'wrap', gap: 1 }}>
            <Button onClick={() => setClash(null)}>Annuler</Button>
            <Button color="inherit" onClick={() => save(clash.student, false)}>
              Inscrire sans toucher à la séance
            </Button>
            <Button
              variant="contained"
              onClick={() => save(clash.student, true)}>
              Inscrire et prévenir le tuteur
            </Button>
          </DialogActions>
        </Dialog>
      )}
      {newStudent && (
        <NewStudentDialog
          onClose={() => setNewStudent(false)}
          onCreated={(student) => {
            setNewStudent(false);
            setStudents((list) => [...list, student]);
            add(student);
          }}
        />
      )}
      <Stack
        direction="row"
        spacing={1}
        flexWrap="wrap"
        useFlexGap
        alignItems="center">
        <Typography variant="body2">
          <b>{registered.length}</b>
          {a.places ? ` / ${a.places}` : ''} inscrit
          {registered.length > 1 ? 's' : ''}
          {waiting.length ? ` · ${waiting.length} en attente` : ''}
        </Typography>
        {noConsent > 0 && (
          <Chip
            size="small"
            color="warning"
            variant="outlined"
            label={`${noConsent} autorisation${noConsent > 1 ? 's' : ''} manquante${noConsent > 1 ? 's' : ''}`}
          />
        )}
      </Stack>
      {!a.registrations.length && (
        <Alert severity="info">Aucun élève inscrit pour l'instant.</Alert>
      )}
      {[...registered, ...waiting, ...left].map((r) => (
        <RegistrationRow
          key={r.id}
          r={r}
          a={a}
          canEdit={canEdit}
          placeFree={placeFree}
          onChanged={reload}
          onPay={() => setPaying(r)}
        />
      ))}
      {paying && (
        <PaymentDialog
          r={paying}
          onClose={() => setPaying(null)}
          onSaved={() => {
            setPaying(null);
            reload();
          }}
        />
      )}
    </Stack>
  );
};

// ---- Adults ----
const StaffTab = ({ a, canEdit, reload }) => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'accompagnateur',
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const linkOf = (s) => `${window.location.origin}/sortie/${s.token}`;
  const add = async () => {
    try {
      await axios.post(
        `${BASE_URL}/admin/activites/${a.id}/accompagnateurs`,
        form
      );
      setForm({ name: '', phone: '', email: '', role: 'accompagnateur' });
      reload();
    } catch (err) {
      toastError(err, "L'accompagnateur n'a pas pu être ajouté");
    }
  };
  const act = async (fn, text) => {
    try {
      await fn();
      reload();
    } catch (err) {
      toastError(err, text);
    }
  };
  const registered = a.registrations.filter(
    (r) => r.status === 'inscrit'
  ).length;
  const needed = Math.ceil(registered / (a.adults_per_students || 8));
  return (
    <Stack spacing={2}>
      {registered > 0 && a.staff.length < needed && (
        <Alert severity="warning">
          {registered} élèves inscrits : il faut au moins {needed} adulte
          {needed > 1 ? 's' : ''} (un pour {a.adults_per_students || 8} élèves).{' '}
          {a.staff.length} prévu{a.staff.length > 1 ? 's' : ''}.
        </Alert>
      )}
      <Typography variant="body2" color="text.secondary">
        Chaque accompagnateur reçoit son propre lien pour cocher les présences
        sur son téléphone, sans compte. Le lien s'ouvre la veille de la sortie
        et jusqu'à deux jours après. Envoyez-le par SMS ou WhatsApp.
      </Typography>
      {a.staff.map((s) => (
        <Paper key={s.id} variant="outlined" sx={{ p: 1.5 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            justifyContent="space-between">
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography fontWeight={600}>{s.name}</Typography>
                <Chip
                  size="small"
                  variant="outlined"
                  label={
                    s.role === 'responsable' ? 'Responsable' : 'Accompagnateur'
                  }
                />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {[s.phone, s.email].filter(Boolean).join(' · ') ||
                  'Pas de contact'}
              </Typography>
            </Box>
            {canEdit && (
              <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
                flexWrap="wrap"
                useFlexGap>
                <Button
                  size="small"
                  startIcon={<ContentCopyIcon />}
                  onClick={() =>
                    copy(
                      `Bonjour ${s.name}, voici votre lien pour cocher les présences de la sortie « ${a.title} » : ${linkOf(s)}`,
                      'Message avec le lien copié'
                    )
                  }>
                  Copier le lien
                </Button>
                <Button
                  size="small"
                  color="inherit"
                  onClick={() =>
                    act(
                      () =>
                        axios.post(
                          `${BASE_URL}/admin/accompagnateurs/${s.id}/nouveau-lien`
                        ),
                      "Le lien n'a pas pu être renouvelé"
                    )
                  }>
                  Nouveau lien
                </Button>
                <IconButton
                  size="small"
                  aria-label="Retirer"
                  onClick={() =>
                    act(
                      () =>
                        axios.delete(
                          `${BASE_URL}/admin/accompagnateurs/${s.id}`
                        ),
                      "L'accompagnateur n'a pas pu être retiré"
                    )
                  }>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            )}
          </Stack>
        </Paper>
      ))}
      {canEdit && (
        <Paper variant="outlined" sx={{ p: 1.5 }}>
          <Typography fontWeight={600} sx={{ mb: 1 }}>
            Ajouter un accompagnateur
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gap: 1,
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            }}>
            <TextField
              size="small"
              label="Nom"
              value={form.name}
              onChange={set('name')}
            />
            <TextField
              select
              size="small"
              label="Rôle"
              value={form.role}
              onChange={set('role')}>
              <MenuItem value="responsable">Responsable</MenuItem>
              <MenuItem value="accompagnateur">Accompagnateur</MenuItem>
            </TextField>
            <TextField
              size="small"
              label="Téléphone"
              value={form.phone}
              onChange={set('phone')}
            />
            <TextField
              size="small"
              label="E-mail"
              value={form.email}
              onChange={set('email')}
            />
          </Box>
          <Button
            sx={{ mt: 1 }}
            variant="contained"
            size="small"
            disabled={!form.name.trim()}
            onClick={add}>
            Ajouter
          </Button>
        </Paper>
      )}
    </Stack>
  );
};

// ---- Budget ----
const BudgetTab = ({ a, canEdit, reload }) => {
  const [costs, setCosts] = useState(a.costs || []);
  useEffect(() => setCosts(a.costs || []), [a.costs]);
  const update = (i, k, v) =>
    setCosts((c) => c.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const save = async () => {
    try {
      await axios.patch(`${BASE_URL}/admin/activites/${a.id}`, { costs });
      toast.success('Budget enregistré', { position: 'bottom-left' });
      reload();
    } catch (err) {
      toastError(err, "Le budget n'a pas pu être enregistré");
    }
  };
  const b = a.budget;
  const Row = ({ label, value, strong, hint }) => (
    <Stack direction="row" justifyContent="space-between" sx={{ py: 0.5 }}>
      <Box>
        <Typography variant="body2" fontWeight={strong ? 700 : 400}>
          {label}
        </Typography>
        {hint && (
          <Typography variant="caption" color="text.secondary">
            {hint}
          </Typography>
        )}
      </Box>
      <Typography
        variant="body2"
        fontWeight={strong ? 700 : 400}
        sx={{ fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Typography>
    </Stack>
  );
  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography fontWeight={600} sx={{ mb: 1 }}>
          Coûts d'achat
        </Typography>
        <Stack spacing={1}>
          {costs.map((c, i) => (
            <Stack key={i} direction="row" spacing={1} alignItems="center">
              <TextField
                size="small"
                label="Poste"
                placeholder="Billets, transport…"
                value={c.label}
                onChange={(e) => update(i, 'label', e.target.value)}
                sx={{ flex: 1 }}
                disabled={!canEdit}
              />
              <TextField
                size="small"
                type="number"
                label="Montant (€)"
                value={c.amount ?? ''}
                onChange={(e) => update(i, 'amount', e.target.value)}
                sx={{ width: 130 }}
                inputProps={{ min: 0, step: 0.01 }}
                disabled={!canEdit}
              />
              {canEdit && (
                <IconButton
                  size="small"
                  aria-label="Retirer"
                  onClick={() => setCosts((x) => x.filter((_, j) => j !== i))}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Stack>
          ))}
        </Stack>
        {canEdit && (
          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
            <Button
              size="small"
              onClick={() =>
                setCosts((c) => [...c, { label: '', amount: '' }])
              }>
              Ajouter un poste
            </Button>
            <Button size="small" variant="contained" onClick={save}>
              Enregistrer
            </Button>
          </Stack>
        )}
      </Paper>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Row label="Coût total" value={euros(b.costs)} strong />
        {b.per_student !== null && (
          <Row label="Coût par élève inscrit" value={euros(b.per_student)} />
        )}
        <Divider sx={{ my: 1 }} />
        <Row
          label="Participations attendues"
          value={euros(b.expected)}
          hint={`${euros(a.fee)} par élève, sauf exceptions`}
        />
        <Row label="Participations encaissées" value={euros(b.received)} />
        <Row label="Reste à encaisser" value={euros(b.still_due)} />
        <Divider sx={{ my: 1 }} />
        <Row
          label="Reste à charge de l'association (prévu)"
          value={euros(b.left_planned)}
          strong
          hint="Coût total moins les participations attendues"
        />
        <Row
          label="Reste à charge à ce jour"
          value={euros(b.left_now)}
          hint="Coût total moins les participations encaissées"
        />
      </Paper>
    </Stack>
  );
};

// Printable list for the day (only shown when printing)
const PresenceSheet = ({ a }) => (
  <Box className="activity-sheet" sx={{ display: 'none', p: 2, fontSize: 12 }}>
    <style>{PRINT_CSS}</style>
    <Typography variant="h6">{a.title}</Typography>
    <Typography variant="body2" sx={{ mb: 1 }}>
      {frDate(a.date)} {hours(a)} · {a.meeting_point || a.place || ''}
    </Typography>
    <Box
      component="table"
      sx={{
        width: '100%',
        borderCollapse: 'collapse',
        '& td, & th': { border: '1px solid #999', p: 0.5, textAlign: 'left' },
      }}>
      <thead>
        <tr>
          <th>Élève</th>
          <th>Niveau</th>
          <th>Parent à appeler</th>
          <th>Autorisation</th>
          <th>Payé</th>
          <th>Présent</th>
        </tr>
      </thead>
      <tbody>
        {a.registrations
          .filter((r) => r.status === 'inscrit')
          .map((r) => (
            <tr key={r.id}>
              <td>{fullName(r)}</td>
              <td>{r.level || ''}</td>
              <td>
                {[r.parent1_firstname, r.parent1_phone || r.parent2_phone]
                  .filter(Boolean)
                  .join(' ')}
              </td>
              <td>{r.consent_at ? 'oui' : 'NON'}</td>
              <td>
                {r.due > 0
                  ? r.paid_amount !== null
                    ? euros(r.paid_amount)
                    : `à payer ${euros(r.due)}`
                  : 'gratuit'}
              </td>
              <td>☐</td>
            </tr>
          ))}
      </tbody>
    </Box>
    <Typography variant="body2" sx={{ mt: 1 }}>
      Accompagnateurs :{' '}
      {a.staff
        .map((s) => `${s.name}${s.phone ? ` (${s.phone})` : ''}`)
        .join(', ') || '—'}
    </Typography>
  </Box>
);

const ActivityPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const userLogged =
    location.state?.userLogged ||
    (() => {
      try {
        return JSON.parse(localStorage.getItem('user'));
      } catch {
        return null;
      }
    })();
  const canEdit = isCulture(userLogged?.user?.role);
  const [a, setA] = useState(null);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState(0);
  const [flyer, setFlyer] = useState(false);
  const load = useCallback(() => {
    axios
      .get(`${BASE_URL}/admin/activites/${id}`)
      .then(({ data }) => setA(data))
      .catch(() => setError(true));
  }, [id]);
  useEffect(load, [load]);

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Activité introuvable.</Alert>
      </Container>
    );
  }
  if (!a) return <LinearProgress sx={{ mt: 4 }} />;
  const st = ACTIVITY_STATUSES[a.shown_status] || ACTIVITY_STATUSES.brouillon;
  const registered = a.registrations.filter(
    (r) => r.status === 'inscrit'
  ).length;
  return (
    <Container maxWidth="md" sx={{ mt: 3, mb: 4 }}>
      <PresenceSheet a={a} />
      <Button
        size="small"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/activites', { state: { userLogged } })}>
        Activités culturelles
      </Button>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        flexWrap="wrap"
        useFlexGap
        sx={{ mt: 1 }}>
        <Typography variant="h5" component="h1">
          {a.title}
        </Typography>
        <Chip size="small" color={st.color} label={st.label} />
      </Stack>
      <Typography
        color="text.secondary"
        sx={{ '&::first-letter': { textTransform: 'uppercase' } }}>
        {frDate(a.date)}
        {hours(a) ? ` · ${hours(a)}` : ''}
        {a.place ? ` · ${a.place}` : ''}
      </Typography>
      <Stack
        direction="row"
        spacing={1}
        flexWrap="wrap"
        useFlexGap
        sx={{ mt: 1.5 }}>
        <Button
          size="small"
          variant="contained"
          startIcon={<ImageIcon />}
          onClick={() => setFlyer(true)}>
          Flyer
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<ContentCopyIcon />}
          onClick={() =>
            copy(familyMessage(a), 'Message pour les familles copié')
          }>
          Message WhatsApp
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<PrintIcon />}
          disabled={!registered}
          onClick={() => window.print()}>
          Feuille de présence
        </Button>
      </Stack>
      <Tabs
        value={tab}
        onChange={(e, v) => setTab(v)}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ mt: 2, mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Infos" />
        <Tab label={`Inscrits (${registered})`} />
        <Tab label={`Accompagnateurs (${a.staff.length})`} />
        <Tab label="Budget" />
      </Tabs>
      {flyer && <FlyerDialog a={a} onClose={() => setFlyer(false)} />}
      {tab === 0 && (
        <InfoTab
          a={a}
          canEdit={canEdit}
          onSaved={setA}
          onDeleted={() => navigate('/activites', { state: { userLogged } })}
        />
      )}
      {tab === 1 && <RegistrationsTab a={a} canEdit={canEdit} reload={load} />}
      {tab === 2 && <StaffTab a={a} canEdit={canEdit} reload={load} />}
      {tab === 3 && <BudgetTab a={a} canEdit={canEdit} reload={load} />}
    </Container>
  );
};

export default ActivityPage;
