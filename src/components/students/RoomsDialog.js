import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';

const BASE_URL = process.env.REACT_APP_BASE_URL;

// The rooms of the three sites: add, rename, move, deactivate. A deactivated
// room is no longer offered, but the sessions that already used it keep it.
const RoomsDialog = ({ open, onClose, onChanged }) => {
  const [rooms, setRooms] = useState(null);
  const [sites, setSites] = useState([]);
  const [newSite, setNewSite] = useState('');
  const [newName, setNewName] = useState('');
  const [newCapacite, setNewCapacite] = useState(1);

  const load = () =>
    axios
      .get(`${BASE_URL}/admin/salles`)
      .then(({ data }) => {
        setRooms(data.rooms);
        setSites(data.sites);
        setNewSite((s) => s || data.sites[0] || '');
      })
      .catch(() => toast.error('Les salles n’ont pas pu être chargées'));

  useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Saves one change, then reloads the list (and the planning behind it)
  const save = (id, body) =>
    axios
      .patch(`${BASE_URL}/admin/salles/${id}`, body)
      .then(() => {
        onChanged?.();
        return load();
      })
      .catch((err) => toast.error(err.response?.data?.error || 'La modification n’a pas pu être enregistrée'));

  const add = () =>
    axios
      .post(`${BASE_URL}/admin/salles`, { site: newSite, name: newName, capacite: Number(newCapacite) || 1 })
      .then(() => {
        setNewName('');
        setNewCapacite(1);
        toast.success('Salle ajoutée');
        onChanged?.();
        return load();
      })
      .catch((err) => toast.error(err.response?.data?.error || 'La salle n’a pas pu être ajoutée'));

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Gérer les salles</DialogTitle>
      <DialogContent dividers>
        {!rooms && <Typography variant="body2">Chargement…</Typography>}
        {rooms &&
          rooms.map((r) => (
            <Stack key={r.id} direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }} sx={{ mb: 1.5, opacity: r.active ? 1 : 0.55 }}>
              <TextField
                select
                size="small"
                label="Site"
                value={r.site}
                onChange={(e) => save(r.id, { site: e.target.value })}
                sx={{ minWidth: 130 }}>
                {sites.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
              <Box sx={{ flexGrow: 1, width: '100%' }}>
                <TextField
                  key={`${r.id}-${r.name}`}
                  size="small"
                  fullWidth
                  label="Nom"
                  defaultValue={r.name}
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (v && v !== r.name) save(r.id, { name: v });
                  }}
                />
              </Box>
              <TextField
                key={`cap-${r.id}-${r.capacite}`}
                size="small"
                type="number"
                label="Places"
                defaultValue={r.capacite}
                inputProps={{ min: 1, max: 10 }}
                sx={{ width: 96 }}
                onBlur={(e) => {
                  const v = Number(e.target.value);
                  if (v !== r.capacite) save(r.id, { capacite: v });
                }}
              />
              <TextField
                key={`seuil-${r.id}-${r.seuil_alerte}`}
                size="small"
                type="number"
                label="Alerte dès"
                defaultValue={r.seuil_alerte ?? ''}
                inputProps={{ min: 1, max: 10 }}
                sx={{ width: 110 }}
                onBlur={(e) => {
                  const raw = e.target.value.trim();
                  const v = raw === '' ? null : Number(raw);
                  if (v !== (r.seuil_alerte ?? null)) save(r.id, { seuil_alerte: v });
                }}
              />
              <FormControlLabel
                control={<Switch checked={r.active} onChange={(e) => save(r.id, { active: e.target.checked })} />}
                label={r.active ? 'Active' : 'Inactive'}
                sx={{ whiteSpace: 'nowrap' }}
              />
            </Stack>
          ))}

        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
          Ajouter une salle
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <TextField select size="small" label="Site" value={newSite} onChange={(e) => setNewSite(e.target.value)} sx={{ minWidth: 130 }}>
            {sites.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
          <TextField size="small" fullWidth label="Nom de la salle" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <TextField size="small" type="number" label="Places" value={newCapacite} onChange={(e) => setNewCapacite(e.target.value)} inputProps={{ min: 1, max: 10 }} sx={{ width: 96 }} />
          <Button variant="contained" disabled={!newName.trim() || !newSite} onClick={add}>
            Ajouter
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoomsDialog;
