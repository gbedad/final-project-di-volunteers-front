import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import ReportProblemIcon from '@mui/icons-material/ReportProblemOutlined';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const today = () =>
  new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' });
const frDate = (d) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString('fr-FR', { timeZone: 'UTC' });
const failed = (err, text) =>
  toast.error(err.response?.data?.error || text, { position: 'bottom-left' });
const EMPTY = { type: '', date: '', binome_id: '', note: '' };

// Incidents of the student, declared by type; open ones are listed in
// "Contrôles" until marked as dealt with. canEdit: managers (declare, deal
// with, delete).
const StudentIncidents = ({ studentId, canEdit }) => {
  const [data, setData] = useState(null);
  const [pairs, setPairs] = useState([]);
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  // Dealing with one: { id, resolution }
  const [closing, setClosing] = useState(null);
  const location = useLocation();
  const box = useRef(null);

  const load = useCallback(() => {
    axios
      .get(`${BASE_URL}/admin/students/${studentId}/incidents`)
      .then(({ data }) => setData(data))
      .catch(() => setData({ types: {}, incidents: [] }));
  }, [studentId]);
  useEffect(load, [load]);
  useEffect(() => {
    axios
      .get(`${BASE_URL}/admin/students/${studentId}/binomes`)
      .then(({ data }) =>
        setPairs(
          (Array.isArray(data) ? data : []).filter((p) =>
            ['actif', 'en pause', 'terminé'].includes(p.status)
          )
        )
      )
      .catch(() => setPairs([]));
  }, [studentId]);
  // Opened from "Contrôles": the block is shown
  useEffect(() => {
    if (data && location.state?.open === 'incidents') {
      box.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [data, location.state]);

  const save = async () => {
    setBusy(true);
    try {
      await axios.post(`${BASE_URL}/admin/students/${studentId}/incidents`, {
        ...form,
        binome_id: form.binome_id || null,
      });
      setForm(null);
      load();
    } catch (err) {
      failed(err, "L'incident n'a pas pu être enregistré");
    } finally {
      setBusy(false);
    }
  };
  const resolve = async (id, body) => {
    try {
      await axios.patch(
        `${BASE_URL}/admin/students/${studentId}/incidents/${id}`,
        body
      );
      setClosing(null);
      load();
    } catch (err) {
      failed(err, 'Mise à jour impossible');
    }
  };
  const remove = async (id) => {
    try {
      await axios.delete(
        `${BASE_URL}/admin/students/${studentId}/incidents/${id}`
      );
      load();
    } catch (err) {
      failed(err, 'Suppression impossible');
    }
  };

  if (!data) return null;
  const { types, incidents } = data;
  const open = incidents.filter((i) => !i.resolved_at).length;
  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));
  return (
    <Box ref={box}>
      {incidents.length === 0 && !form && (
        <Typography variant="body2" color="text.secondary">
          Aucun incident.
        </Typography>
      )}
      {open > 0 && (
        <Typography variant="body2" color="error" sx={{ mb: 1 }}>
          {open} incident{open > 1 ? 's' : ''} à traiter (visible
          {open > 1 ? 's' : ''} dans Contrôles)
        </Typography>
      )}
      <Stack spacing={1.25}>
        {incidents.map((i) => (
          <Stack
            key={i.id}
            direction="row"
            spacing={1}
            alignItems="flex-start"
            sx={{
              borderLeft: 3,
              borderColor: i.resolved_at ? 'divider' : 'error.main',
              pl: 1.25,
            }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack
                direction="row"
                spacing={0.75}
                alignItems="center"
                flexWrap="wrap"
                useFlexGap>
                <Typography variant="body2" fontWeight={600}>
                  {i.type_label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {frDate(i.date)}
                </Typography>
                {i.resolved_at ? (
                  <Chip
                    size="small"
                    color="success"
                    variant="outlined"
                    label="Traité"
                  />
                ) : (
                  <Chip
                    size="small"
                    color="error"
                    variant="outlined"
                    label="À traiter"
                  />
                )}
              </Stack>
              {i.note && (
                <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                  {i.note}
                </Typography>
              )}
              <Typography
                variant="caption"
                color="text.secondary"
                component="div">
                {[
                  i.tutor && `Tuteur : ${i.tutor}`,
                  i.created_by_name && `Déclaré par ${i.created_by_name}`,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Typography>
              {i.resolved_at && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  component="div">
                  Traité le{' '}
                  {new Date(i.resolved_at).toLocaleDateString('fr-FR')}
                  {i.resolved_by_name ? ` par ${i.resolved_by_name}` : ''}
                  {i.resolution ? ` : ${i.resolution}` : ''}
                </Typography>
              )}
              {closing?.id === i.id && (
                <Stack spacing={1} sx={{ mt: 1 }}>
                  <TextField
                    size="small"
                    autoFocus
                    label="Ce qui a été fait (facultatif)"
                    placeholder="Ex. : appel à la famille le 14/11"
                    value={closing.resolution}
                    onChange={(e) =>
                      setClosing({ ...closing, resolution: e.target.value })
                    }
                  />
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() =>
                        resolve(i.id, {
                          resolved: true,
                          resolution: closing.resolution,
                        })
                      }>
                      Marquer traité
                    </Button>
                    <Button size="small" onClick={() => setClosing(null)}>
                      Annuler
                    </Button>
                  </Stack>
                </Stack>
              )}
              {canEdit && closing?.id !== i.id && (
                <Button
                  size="small"
                  sx={{ px: 0, minWidth: 0, mt: 0.25 }}
                  onClick={() =>
                    i.resolved_at
                      ? resolve(i.id, { resolved: false })
                      : setClosing({ id: i.id, resolution: '' })
                  }>
                  {i.resolved_at ? 'Rouvrir' : 'Traité…'}
                </Button>
              )}
            </Box>
            {canEdit && (
              <IconButton
                size="small"
                aria-label="Supprimer l'incident"
                title="Supprimer (déclaré par erreur)"
                onClick={() => remove(i.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>
        ))}
      </Stack>
      {form ? (
        <Stack spacing={1.5} sx={{ mt: 1.5 }}>
          <TextField
            select
            size="small"
            label="Type d'incident"
            value={form.type}
            onChange={set('type')}>
            {Object.entries(types).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            type="date"
            label="Date"
            value={form.date}
            onChange={set('date')}
            inputProps={{ max: today() }}
            InputLabelProps={{ shrink: true }}
          />
          {pairs.length > 0 && (
            <TextField
              select
              size="small"
              label="Binôme concerné"
              value={form.binome_id}
              onChange={set('binome_id')}
              SelectProps={{ displayEmpty: true }}
              InputLabelProps={{ shrink: true }}>
              <MenuItem value="">Aucun en particulier</MenuItem>
              {pairs.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {[p.tutor?.first_name, p.tutor?.last_name]
                    .filter(Boolean)
                    .join(' ') || 'Tuteur'}{' '}
                  · {(p.subjects || []).join(', ')}
                </MenuItem>
              ))}
            </TextField>
          )}
          <TextField
            size="small"
            label={form.type === 'autre' ? 'Ce qui s’est passé' : 'Précision'}
            multiline
            minRows={2}
            value={form.note}
            onChange={set('note')}
          />
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              size="small"
              disabled={
                busy ||
                !form.type ||
                !form.date ||
                (form.type === 'autre' && !form.note.trim())
              }
              onClick={save}>
              Enregistrer
            </Button>
            <Button size="small" onClick={() => setForm(null)}>
              Annuler
            </Button>
          </Stack>
        </Stack>
      ) : (
        canEdit && (
          <Button
            size="small"
            startIcon={<ReportProblemIcon />}
            sx={{ mt: 1 }}
            onClick={() => {
              const active = pairs.filter((p) =>
                ['actif', 'en pause'].includes(p.status)
              );
              setForm({
                ...EMPTY,
                date: today(),
                binome_id: active.length === 1 ? active[0].id : '',
              });
            }}>
            Déclarer un incident
          </Button>
        )
      )}
    </Box>
  );
};

export default StudentIncidents;
