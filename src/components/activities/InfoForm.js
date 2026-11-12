import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Link,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import TimeInput from '../TimeInput';
import { LEVELS } from '../../js/volunteerSearch';
import {
  ACTIVITY_STATUSES,
  BASE_URL,
  EDITABLE_STATUSES,
  KINDS,
  resizeImage,
} from './activityUtils';

const toastError = (err, text) =>
  toast.error(err.response?.data?.error || text, { position: 'bottom-left' });
const grid = {
  display: 'grid',
  gap: 2,
  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
};
const full = { gridColumn: { sm: '1 / -1' } };

const Section = ({ title, hint, children }) => (
  <Paper variant="outlined" sx={{ p: 2 }}>
    <Typography fontWeight={600}>{title}</Typography>
    {hint && (
      <Typography variant="caption" color="text.secondary" component="p">
        {hint}
      </Typography>
    )}
    <Box sx={{ ...grid, mt: 1.5 }}>{children}</Box>
  </Paper>
);

// Preparation or debrief session: { date, start_time, end_time, place, by }
const SessionFields = ({ label, value, onChange, disabled }) => {
  const v = value || {};
  const set = (k, x) => onChange({ ...v, [k]: x });
  return (
    <>
      <Typography variant="body2" fontWeight={600} sx={full}>
        {label}
      </Typography>
      <TextField
        size="small"
        type="date"
        label="Date"
        value={v.date || ''}
        onChange={(e) => set('date', e.target.value)}
        InputLabelProps={{ shrink: true }}
        disabled={disabled}
      />
      <Stack direction="row" spacing={1}>
        <TimeInput
          label="Début"
          value={v.start_time || ''}
          onChange={(t) => set('start_time', t)}
          sx={{ flex: 1 }}
          disabled={disabled}
        />
        <TimeInput
          label="Fin"
          value={v.end_time || ''}
          after={v.start_time}
          onChange={(t) => set('end_time', t)}
          sx={{ flex: 1 }}
          disabled={disabled}
        />
      </Stack>
      <TextField
        size="small"
        label="Lieu (ou « en ligne »)"
        value={v.place || ''}
        onChange={(e) => set('place', e.target.value)}
        disabled={disabled}
      />
      <TextField
        size="small"
        label="Animée par"
        value={v.by || ''}
        onChange={(e) => set('by', e.target.value)}
        disabled={disabled}
      />
    </>
  );
};

// Preparation notes, dated and signed ("EB : livret transmis…")
const Notes = ({ a, canEdit, onSaved }) => {
  const [text, setText] = useState('');
  const add = async () => {
    try {
      const { data } = await axios.post(
        `${BASE_URL}/admin/activites/${a.id}/notes`,
        { text }
      );
      setText('');
      onSaved(data);
    } catch (err) {
      toastError(err, "La note n'a pas pu être enregistrée");
    }
  };
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography fontWeight={600}>Conception et préparation</Typography>
      <Typography variant="caption" color="text.secondary" component="p">
        Le fil des échanges de l'équipe : ce qui a été fait, transmis, décidé.
      </Typography>
      <Stack spacing={1} sx={{ mt: 1.5 }}>
        {(a.notes || []).map((n, i) => (
          <Box key={i}>
            <Typography variant="caption" color="text.secondary">
              {new Date(n.at).toLocaleDateString('fr-FR')} · {n.by}
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {n.text}
            </Typography>
          </Box>
        ))}
        {!(a.notes || []).length && (
          <Typography variant="body2" color="text.secondary">
            Aucune note pour l'instant.
          </Typography>
        )}
        {canEdit && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <TextField
              size="small"
              fullWidth
              multiline
              placeholder="Ex. : livret préparatoire transmis aux participants"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <Button variant="outlined" disabled={!text.trim()} onClick={add}>
              Ajouter
            </Button>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};

// The activity's information, in four parts
const InfoForm = ({ a, programs = [], canEdit, onSaved, onDeleted }) => {
  const [form, setForm] = useState(a);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  useEffect(() => setForm(a), [a]);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setValue = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const save = async () => {
    setBusy(true);
    try {
      const fields = [
        'title',
        'kind',
        'status',
        'program',
        'objective',
        'description',
        'link',
        'levels',
        'image',
        'date',
        'start_time',
        'end_time',
        'place',
        'meeting_point',
        'meeting_time',
        'meeting_point2',
        'meeting_time2',
        'bring',
        'responsible',
        'whatsapp_group',
        'places',
        'deadline',
        'fee',
        'adults_per_students',
        'prep',
        'debrief',
        'review',
      ];
      const body = Object.fromEntries(fields.map((k) => [k, form[k] ?? null]));
      body.volunteer_minutes =
        form.volunteer_hours === undefined
          ? a.volunteer_minutes
          : form.volunteer_hours === ''
            ? null
            : Math.round(
                Number(String(form.volunteer_hours).replace(',', '.')) * 60
              );
      const { data } = await axios.patch(
        `${BASE_URL}/admin/activites/${a.id}`,
        body
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
      setValue('image')(await resizeImage(file));
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
  const d = !canEdit;
  const volunteerHours =
    form.volunteer_hours !== undefined
      ? form.volunteer_hours
      : a.volunteer_minutes
        ? String(Math.round((a.volunteer_minutes / 60) * 10) / 10).replace(
            '.',
            ','
          )
        : '';

  return (
    <Stack spacing={2}>
      <Section title="Présentation">
        <TextField
          size="small"
          label="Titre"
          value={form.title || ''}
          onChange={set('title')}
          disabled={d}
          sx={full}
        />
        <Autocomplete
          freeSolo
          size="small"
          options={programs}
          value={form.program || ''}
          onInputChange={(e, v) => setValue('program')(v)}
          disabled={d}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Parcours"
              placeholder="Ex. : Musique classique"
            />
          )}
        />
        <TextField
          select
          size="small"
          label="Type"
          value={form.kind || ''}
          onChange={set('kind')}
          disabled={d}>
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
          disabled={d}>
          {EDITABLE_STATUSES.map((s) => (
            <MenuItem key={s} value={s}>
              {ACTIVITY_STATUSES[s].label}
            </MenuItem>
          ))}
        </TextField>
        <Autocomplete
          multiple
          size="small"
          options={LEVELS}
          value={form.levels || []}
          onChange={(e, v) => setValue('levels')(v)}
          disabled={d}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Cible (niveaux)"
              placeholder="Tous âges si vide"
            />
          )}
        />
        <TextField
          size="small"
          label="Objectif"
          placeholder="Ex. : découvrir Schubert, assister à un concert"
          value={form.objective || ''}
          onChange={set('objective')}
          multiline
          disabled={d}
          sx={full}
        />
        <TextField
          size="small"
          label="Description"
          value={form.description || ''}
          onChange={set('description')}
          multiline
          minRows={3}
          disabled={d}
          sx={full}
        />
        <TextField
          size="small"
          label="Lien (programme, billetterie)"
          placeholder="https://"
          value={form.link || ''}
          onChange={set('link')}
          disabled={d}
          sx={full}
          helperText={
            form.link && /^https?:\/\//.test(form.link) ? (
              <Link href={form.link} target="_blank" rel="noreferrer">
                Ouvrir le lien
              </Link>
            ) : null
          }
        />
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ sm: 'center' }}
          sx={full}>
          {form.image && (
            <Box
              component="img"
              src={form.image}
              alt=""
              sx={{ width: 180, maxWidth: '100%', borderRadius: 1 }}
            />
          )}
          {canEdit && (
            <Stack direction="row" spacing={1}>
              <Button component="label" size="small" variant="outlined">
                {form.image ? "Changer l'image" : 'Ajouter une image'}
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={pickImage}
                />
              </Button>
              {form.image && (
                <Button
                  size="small"
                  color="inherit"
                  onClick={() => setValue('image')(null)}>
                  Retirer
                </Button>
              )}
            </Stack>
          )}
        </Stack>
      </Section>

      <Section title="Organisation">
        <TextField
          size="small"
          type="date"
          label="Date"
          value={form.date || ''}
          onChange={set('date')}
          InputLabelProps={{ shrink: true }}
          disabled={d}
        />
        <Stack direction="row" spacing={1}>
          <TimeInput
            label="Début"
            value={form.start_time || ''}
            onChange={setValue('start_time')}
            sx={{ flex: 1 }}
            disabled={d}
          />
          <TimeInput
            label="Fin"
            value={form.end_time || ''}
            after={form.start_time}
            onChange={setValue('end_time')}
            sx={{ flex: 1 }}
            disabled={d}
          />
        </Stack>
        <TextField
          size="small"
          label="Lieu"
          value={form.place || ''}
          onChange={set('place')}
          disabled={d}
          sx={full}
        />
        <TextField
          size="small"
          label="Point de rendez-vous 1"
          value={form.meeting_point || ''}
          onChange={set('meeting_point')}
          disabled={d}
        />
        <TimeInput
          label="Heure du rendez-vous 1"
          value={form.meeting_time || ''}
          onChange={setValue('meeting_time')}
          sx={{ width: '100%' }}
          disabled={d}
        />
        <TextField
          size="small"
          label="Point de rendez-vous 2 (facultatif)"
          value={form.meeting_point2 || ''}
          onChange={set('meeting_point2')}
          disabled={d}
        />
        <TimeInput
          label="Heure du rendez-vous 2"
          value={form.meeting_time2 || ''}
          onChange={setValue('meeting_time2')}
          sx={{ width: '100%' }}
          disabled={d}
        />
        <TextField
          size="small"
          label="À apporter"
          placeholder="Pièce d'identité, goûter, carte Navigo…"
          value={form.bring || ''}
          onChange={set('bring')}
          disabled={d}
          sx={full}
        />
        <TextField
          size="small"
          label="Responsable"
          value={form.responsible || ''}
          onChange={set('responsible')}
          disabled={d}
        />
        <TextField
          size="small"
          label="Groupe WhatsApp"
          value={form.whatsapp_group || ''}
          onChange={set('whatsapp_group')}
          disabled={d}
        />
        <TextField
          size="small"
          type="number"
          label="Places (enfants)"
          value={form.places ?? ''}
          onChange={set('places')}
          inputProps={{ min: 1 }}
          disabled={d}
        />
        <TextField
          size="small"
          type="date"
          label="Inscriptions jusqu'au"
          value={form.deadline || ''}
          onChange={set('deadline')}
          InputLabelProps={{ shrink: true }}
          disabled={d}
        />
        <TextField
          size="small"
          type="number"
          label="Participation par enfant (€)"
          value={form.fee ?? 0}
          onChange={set('fee')}
          inputProps={{ min: 0, step: 0.5 }}
          helperText="0 : gratuit. Les parents accompagnateurs ne paient pas."
          disabled={d}
        />
        <TextField
          size="small"
          type="number"
          label="Un adulte pour … enfants"
          value={form.adults_per_students ?? 8}
          onChange={set('adults_per_students')}
          inputProps={{ min: 1 }}
          disabled={d}
        />
      </Section>

      <Section
        title="Préparation et retour"
        hint="Séance préparatoire avant la sortie, séance de retour après : les présences se notent sur chaque inscrit.">
        <SessionFields
          label="Séance préparatoire"
          value={form.prep}
          onChange={setValue('prep')}
          disabled={d}
        />
        <Divider sx={full} />
        <SessionFields
          label="Séance de retour (bilan avec les enfants)"
          value={form.debrief}
          onChange={setValue('debrief')}
          disabled={d}
        />
        <Divider sx={full} />
        <TextField
          size="small"
          label="Temps bénévole total (heures)"
          value={volunteerHours}
          onChange={(e) => setValue('volunteer_hours')(e.target.value)}
          helperText="Préparation, accompagnement, retour : pour les dossiers de subvention (bénévolat valorisé)"
          disabled={d}
          sx={full}
        />
      </Section>

      <Section title="Bilan">
        <TextField
          size="small"
          label="Bilan de la sortie"
          placeholder="Ce qui a marché, retours des enfants, à refaire ?"
          value={form.review || ''}
          onChange={set('review')}
          multiline
          minRows={3}
          disabled={d}
          sx={full}
        />
      </Section>

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

      <Notes
        a={a}
        canEdit={canEdit}
        onSaved={(notes) => onSaved({ ...a, notes })}
      />

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Supprimer « {a.title} » ?</DialogTitle>
        <DialogContent>
          <Typography>
            Les inscriptions ({a.registrations.length}), les accompagnateurs et
            les dépenses sont supprimés aussi. Pour une sortie qui n'aura pas
            lieu, préférez le statut « Annulée ».
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

export default InfoForm;
