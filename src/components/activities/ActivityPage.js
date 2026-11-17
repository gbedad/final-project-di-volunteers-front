import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import EditIcon from '@mui/icons-material/EditOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PrintIcon from '@mui/icons-material/Print';
import FlyerDialog from './Flyer';
import InfoForm from './InfoForm';
import ChatTab from './ChatTab';
import RegistrationDialog from './RegistrationDialog';
import { BudgetPanel } from './Expenses';
import ImageIcon from '@mui/icons-material/Image';
import CampaignIcon from '@mui/icons-material/Campaign';
import ShareIcon from '@mui/icons-material/Share';
import { LEVELS } from '../../js/volunteerSearch';
import { isCulture, isManager, ROLE_LABELS } from '../../js/roles';
import {
  CONSENT_STATES,
  ACTIVITY_STATUSES,
  BASE_URL,
  PAYMENT_METHODS,
  ambassadorText,
  euros,
  familyMessage,
  pointChoices,
  frDate,
  hours,
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
@page { size: A4 landscape; margin: 10mm; }
@media print {
  body * { visibility: hidden !important; }
  .activity-sheet, .activity-sheet * { visibility: visible !important; }
  .activity-sheet { position: absolute; left: 0; top: 0; width: 100%; box-sizing: border-box; display: block !important; }
}`;

// ---- Registrations ----
const PaymentDialog = ({ r, onClose, onSaved }) => {
  const [form, setForm] = useState({
    fee_override: r.fee_override ?? '',
    paid_amount: r.paid_amount ?? r.due,
    paid_method: r.paid_method || 'assoconnect',
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
// Telling the tutor (session cancelled): the admins only, not the people in
// charge of the outings
const TutoringNotice = ({ r, canTell, onChanged }) => {
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
      {canTell && open.length > 0 && (
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

// Who writes the outing on MyCogniverse (and may change it); changed by
// "superculture" and the admins
const OwnerLine = ({ a, onChanged }) => {
  const [people, setPeople] = useState(null);
  useEffect(() => {
    if (!a.can_change_owner) return;
    axios
      .get(`${BASE_URL}/admin/activites-responsables`)
      .then(({ data }) => setPeople(data))
      .catch(() => setPeople([]));
  }, [a.can_change_owner]);
  const change = async (ownerId) => {
    try {
      await axios.patch(`${BASE_URL}/admin/activites/${a.id}`, {
        owner_id: ownerId,
      });
      toast.success('Rédacteur changé', { position: 'bottom-left' });
      onChanged();
    } catch (err) {
      toastError(err, "Le rédacteur n'a pas pu être changé");
    }
  };
  if (!a.can_change_owner || !people?.length)
    return (
      <Typography variant="body2" color="text.secondary">
        Rédacteur de l'activité : {a.owner || '—'}
      </Typography>
    );
  return (
    <TextField
      select
      size="small"
      label="Rédacteur de l'activité"
      value={people.some((p) => p.id === a.owner_id) ? a.owner_id : ''}
      onChange={(e) => change(e.target.value)}
      sx={{ mt: 1.5, minWidth: 240, maxWidth: '100%' }}>
      {people.map((p) => (
        <MenuItem key={p.id} value={p.id}>
          {p.first_name} {p.last_name} · {ROLE_LABELS[p.role] || p.role}
        </MenuItem>
      ))}
    </TextField>
  );
};

const RegistrationRow = ({
  r,
  a,
  canEdit,
  canTell,
  onChanged,
  onPay,
  onOpen,
  placeFree,
}) => {
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
            <Typography
              fontWeight={600}
              onClick={onOpen}
              sx={{
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' },
              }}>
              {fullName(r)}
            </Typography>
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
              <Chip
                size="small"
                color={CONSENT_STATES[r.consent_state]?.color || 'warning'}
                variant={r.consent_at ? 'filled' : 'outlined'}
                label={
                  CONSENT_STATES[r.consent_state]?.label ||
                  'Autorisation à demander'
                }
                onClick={onOpen}
              />
              <Chip
                size="small"
                variant="outlined"
                color={r.membership ? 'default' : 'warning'}
                label={
                  r.membership
                    ? `${r.kind} · cotisation à jour`
                    : `${r.kind} · cotisation à demander`
                }
                onClick={onOpen}
              />
              {r.departure === 'seul' && (
                <Chip size="small" variant="outlined" label="Repart seul(e)" />
              )}
              {(pointChoices(a, 'aller').length > 1 ||
                pointChoices(a, 'retour').length > 1) && (
                <Chip
                  size="small"
                  variant="outlined"
                  label={`RDV aller ${r.meeting_choice || 1} · retour ${r.return_choice || 1}`}
                  onClick={onOpen}
                />
              )}
              {/* No participation: the membership chip says the rest */}
              {(owes || paid) && (
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
            <TutoringNotice r={r} canTell={canTell} onChanged={onChanged} />
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

const RegistrationsTab = ({ a, canEdit, canTell, reload }) => {
  const [students, setStudents] = useState([]);
  const [picked, setPicked] = useState(null);
  const [paying, setPaying] = useState(null);
  // One registered child's sheet (kept by id: the list reloads)
  const [detail, setDetail] = useState(null);
  const detailed = a.registrations.find((x) => x.id === detail);
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
  // Choosing a name only selects the student: the registration is the
  // "Inscrire" button
  const [adding, setAdding] = useState(false);
  const add = async (student) => {
    if (!student || adding) return;
    setAdding(true);
    try {
      let found = [];
      try {
        ({ data: found } = await axios.get(
          `${BASE_URL}/admin/activites/${a.id}/conflits`,
          { params: { student_id: student.id } }
        ));
      } catch {}
      if (found.length) setClash({ student, found });
      else await save(student, false);
    } finally {
      setAdding(false);
    }
  };
  const registered = a.registrations.filter((r) => r.status === 'inscrit');
  const waiting = a.registrations.filter((r) => r.status === 'attente');
  const left = a.registrations.filter((r) => r.status === 'désisté');
  const placeFree = !a.places || registered.length < a.places;
  const noConsent = registered.filter((r) => !r.consent_at).length;
  return (
    <Stack spacing={2}>
      {canEdit && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          alignItems={{ sm: 'center' }}>
          <Autocomplete
            size="small"
            options={options}
            groupBy={(o) => o.group}
            value={picked}
            onChange={(e, v) => setPicked(v)}
            getOptionLabel={(s) =>
              `${s.first_name} ${s.last_name || ''} · ${s.level || 'niveau ?'}`
            }
            isOptionEqualToValue={(o, v) => o.id === v.id}
            sx={{ flex: 1 }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Élève à inscrire"
                placeholder="Prénom ou nom"
              />
            )}
          />
          <Button
            variant="contained"
            disabled={!picked || adding}
            onClick={() => add(picked)}>
            {placeFree ? 'Inscrire' : "Mettre en liste d'attente"}
          </Button>
        </Stack>
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
                {canTell
                  ? "Prévenir le tuteur annule la séance ce jour-là (« Pas de séance », motif : élève indisponible) et lui envoie un e-mail. Si l'élève se désiste, la séance est rétablie et le tuteur prévenu."
                  : "C'est un administrateur qui prévient le tuteur : signalez-lui cette inscription."}
              </Typography>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ flexWrap: 'wrap', gap: 1 }}>
            <Button onClick={() => setClash(null)}>Annuler</Button>
            {canTell ? (
              <>
                <Button
                  color="inherit"
                  onClick={() => save(clash.student, false)}>
                  Inscrire sans toucher à la séance
                </Button>
                <Button
                  variant="contained"
                  onClick={() => save(clash.student, true)}>
                  Inscrire et prévenir le tuteur
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                onClick={() => save(clash.student, false)}>
                Inscrire
              </Button>
            )}
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
          canTell={canTell}
          placeFree={placeFree}
          onChanged={reload}
          onPay={() => setPaying(r)}
          onOpen={() => setDetail(r.id)}
        />
      ))}
      {detailed && (
        <RegistrationDialog
          r={detailed}
          a={a}
          canEdit={canEdit}
          onPay={() => setPaying(detailed)}
          onClose={() => setDetail(null)}
          onChanged={reload}
        />
      )}
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

// Name, role (parent of which child), phone and e-mail of an adult
const StaffFields = ({ a, form, set }) => (
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
      {/* Former role, now the outing's "Responsable" (onglet Infos) */}
      {form.role === 'responsable' && (
        <MenuItem value="responsable">Responsable</MenuItem>
      )}
      <MenuItem value="accompagnateur">Accompagnateur</MenuItem>
      <MenuItem value="parent">Parent d'un enfant inscrit</MenuItem>
    </TextField>
    {form.role === 'parent' && (
      <TextField
        select
        size="small"
        label="Parent de"
        value={form.student_id || ''}
        onChange={set('student_id')}
        sx={{ gridColumn: { sm: '1 / -1' } }}>
        {a.registrations
          .filter((r) => r.status === 'inscrit')
          .map((r) => (
            <MenuItem key={r.student_id} value={r.student_id}>
              {fullName(r)}
            </MenuItem>
          ))}
      </TextField>
    )}
    <TextField
      size="small"
      label="Téléphone"
      value={form.phone || ''}
      onChange={set('phone')}
    />
    <TextField
      size="small"
      label="E-mail"
      value={form.email || ''}
      onChange={set('email')}
    />
  </Box>
);

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
  // The adult being changed (a copy of its fields)
  const [editing, setEditing] = useState(null);
  const setEdit = (k) => (e) =>
    setEditing((f) => ({ ...f, [k]: e.target.value }));
  const saveEdit = async () => {
    const { id, name, phone, email, role, student_id } = editing;
    try {
      await axios.patch(`${BASE_URL}/admin/accompagnateurs/${id}`, {
        name,
        phone,
        email,
        role,
        student_id,
      });
      setEditing(null);
      reload();
    } catch (err) {
      toastError(err, "L'accompagnateur n'a pas pu être modifié");
    }
  };
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
  // Adults planned (onglet Infos) and those already named here
  const planned = a.companions ?? null;
  const missing = planned !== null ? planned - a.staff.length : 0;
  return (
    <Stack spacing={2}>
      {missing > 0 && (
        <Alert severity="warning">
          {planned} accompagnant{planned > 1 ? 's' : ''} prévu
          {planned > 1 ? 's' : ''}, {a.staff.length} inscrit
          {a.staff.length > 1 ? 's' : ''} ici : il en manque {missing}.
        </Alert>
      )}
      {planned === null && (
        <Typography variant="body2" color="text.secondary">
          Nombre d'accompagnants prévus : à indiquer dans l'onglet Infos.
        </Typography>
      )}
      <Typography variant="body2" color="text.secondary">
        Chaque accompagnateur reçoit son propre lien pour cocher les présences
        sur son téléphone, sans compte. Le lien s'ouvre la veille de la sortie
        et jusqu'à deux jours après. Envoyez-le par SMS ou WhatsApp.
      </Typography>
      {a.staff.map((s) =>
        editing?.id === s.id ? (
          <Paper key={s.id} variant="outlined" sx={{ p: 1.5 }}>
            <Typography fontWeight={600} sx={{ mb: 1 }}>
              Modifier {s.name}
            </Typography>
            <StaffFields a={a} form={editing} set={setEdit} />
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button
                variant="contained"
                size="small"
                disabled={!editing.name?.trim()}
                onClick={saveEdit}>
                Enregistrer
              </Button>
              <Button size="small" onClick={() => setEditing(null)}>
                Annuler
              </Button>
            </Stack>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 0.5 }}>
              Son lien reste le même.
            </Typography>
          </Paper>
        ) : (
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
                      s.role === 'responsable'
                        ? 'Responsable'
                        : s.role === 'parent'
                          ? `Parent${s.child_first_name ? ` de ${s.child_first_name}` : ''}`
                          : 'Accompagnateur'
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
                    aria-label="Modifier"
                    title="Modifier"
                    onClick={() =>
                      setEditing({
                        id: s.id,
                        name: s.name || '',
                        phone: s.phone || '',
                        email: s.email || '',
                        role: s.role,
                        student_id: s.student_id || '',
                      })
                    }>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    aria-label="Retirer"
                    title="Retirer"
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
        )
      )}
      {canEdit && (
        <Paper variant="outlined" sx={{ p: 1.5 }}>
          <Typography fontWeight={600} sx={{ mb: 1 }}>
            Ajouter un accompagnateur
          </Typography>
          <StaffFields a={a} form={form} set={set} />
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

// For the ambassadors who offer the outing: the detailed presentation, to
// copy or share (WhatsApp, e-mail…)
const AmbassadorDialog = ({ a, onClose }) => {
  const text = ambassadorText(a);
  const canShare = typeof navigator !== 'undefined' && !!navigator.share;
  const share = async () => {
    try {
      await navigator.share({ title: a.title, text });
    } catch (err) {
      if (err?.name !== 'AbortError') {
        toast.error('Partage impossible : copiez le texte', {
          position: 'bottom-left',
        });
      }
    }
  };
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Pour les ambassadeurs</DialogTitle>
      <DialogContent>
        {!a.ambassador_brief && (
          <Alert severity="info" sx={{ mb: 1.5 }}>
            Pas encore de présentation détaillée : la description est reprise.
            Complétez « Présentation détaillée pour les ambassadeurs » dans
            l'onglet Infos.
          </Alert>
        )}
        <TextField
          fullWidth
          multiline
          minRows={10}
          value={text}
          InputProps={{ readOnly: true }}
          onFocus={(e) => e.target.select()}
        />
      </DialogContent>
      <DialogActions sx={{ flexWrap: 'wrap', gap: 1 }}>
        <Button onClick={onClose}>Fermer</Button>
        {canShare && (
          <Button startIcon={<ShareIcon />} onClick={share}>
            Partager
          </Button>
        )}
        <Button
          variant="contained"
          startIcon={<ContentCopyIcon />}
          onClick={() => copy(text, 'Présentation copiée')}>
          Copier
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Printable list for the day (only shown when printing)
const PresenceSheet = ({ a }) => (
  <Box className="activity-sheet" sx={{ display: 'none', p: 2, fontSize: 12 }}>
    <style>{PRINT_CSS}</style>
    <Typography variant="h6">{a.title}</Typography>
    <Typography variant="body2" sx={{ mb: 1 }}>
      {frDate(a.date)} {hours(a)} · {a.place || ''}
      {a.organizer
        ? ` · Responsable : ${a.organizer}${a.organizer_phone ? ` (${a.organizer_phone})` : ''}`
        : ''}
    </Typography>
    <Typography variant="body2" sx={{ mb: 1 }}>
      {[
        pointChoices(a, 'aller')
          .map((c) => `Aller ${c.n} : ${c.text}`)
          .join(' · '),
        pointChoices(a, 'retour')
          .map((c) => `Retour ${c.n} : ${c.text}`)
          .join(' · '),
      ]
        .filter(Boolean)
        .join(' — ')}
    </Typography>
    <Box
      component="table"
      sx={{
        width: '100%',
        borderCollapse: 'collapse',
        // Landscape A4: every column fits, long names wrap
        fontSize: 11,
        '& td, & th': {
          border: '1px solid #999',
          p: '2px 4px',
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
          <th>Aller</th>
          <th>Retour</th>
          <th>Arrive / repart</th>
          <th>Autorisation</th>
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
              <td>{r.school_name || ''}</td>
              <td>{r.student_phone || ''}</td>
              <td>
                {[
                  r.parent1_firstname,
                  r.emergency_phone || r.parent1_phone || r.parent2_phone,
                ]
                  .filter(Boolean)
                  .join(' ')}
              </td>
              {/* The point's number: the points are listed above */}
              <td>
                {pointChoices(a, 'aller').length ? r.meeting_choice || 1 : ''}
              </td>
              <td>
                {pointChoices(a, 'retour').length ? r.return_choice || 1 : ''}
              </td>
              <td>
                {r.arrival || '?'} /{' '}
                {r.departure === 'seul' ? 'SEUL(E)' : r.departure || '?'}
              </td>
              <td>{r.consent_at ? 'oui' : 'NON'}</td>
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
  const cultureRole = isCulture(userLogged?.user?.role);
  const canTell = isManager(userLogged?.user?.role);
  const [a, setA] = useState(null);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState(0);
  const [flyer, setFlyer] = useState(false);
  const [ambassadors, setAmbassadors] = useState(false);
  // Messages of the "Chat" tab (its label)
  const [chatCount, setChatCount] = useState(null);
  // Programmes already used, offered when typing one
  const [programs, setPrograms] = useState([]);
  useEffect(() => {
    axios
      .get(`${BASE_URL}/admin/activites`)
      .then(({ data }) =>
        setPrograms([...new Set(data.map((x) => x.program).filter(Boolean))])
      )
      .catch(() => {});
  }, []);
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
  // "culture": only the outings it is in charge of; the others, read only
  const canEdit = cultureRole && a.can_edit !== false;
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
      <OwnerLine a={a} onChanged={load} />
      {a.organizer && (
        <Typography variant="body2" color="text.secondary">
          Responsable : {a.organizer}
          {a.organizer_phone ? ` · ${a.organizer_phone}` : ''}
        </Typography>
      )}
      {cultureRole && !canEdit && (
        <Alert severity="info" sx={{ mt: 1.5 }}>
          Sortie rédigée par {a.owner || 'un autre rédacteur'} : vous pouvez la
          consulter, pas la modifier.
        </Alert>
      )}
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
          startIcon={<CampaignIcon />}
          onClick={() => setAmbassadors(true)}>
          Pour les ambassadeurs
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
        <Tab
          label={`Accompagnateurs (${a.staff.length}${a.companions != null ? `/${a.companions}` : ''})`}
        />
        <Tab label="Budget" />
        <Tab label={`Chat (${chatCount ?? (a.chat || []).length})`} />
      </Tabs>
      {flyer && (
        <FlyerDialog
          a={a}
          canEdit={canEdit}
          onSaved={setA}
          onClose={() => setFlyer(false)}
        />
      )}
      {ambassadors && (
        <AmbassadorDialog a={a} onClose={() => setAmbassadors(false)} />
      )}
      {tab === 0 && (
        <InfoForm
          a={a}
          programs={programs}
          canEdit={canEdit}
          onSaved={setA}
          onDeleted={() => navigate('/activites', { state: { userLogged } })}
        />
      )}
      {tab === 1 && (
        <RegistrationsTab
          a={a}
          canEdit={canEdit}
          canTell={canTell}
          reload={load}
        />
      )}
      {tab === 2 && <StaffTab a={a} canEdit={canEdit} reload={load} />}
      {tab === 3 && <BudgetPanel a={a} canEdit={canEdit} reload={load} />}
      {tab === 4 && <ChatTab activityId={a.id} onCount={setChatCount} />}
    </Container>
  );
};

export default ActivityPage;
