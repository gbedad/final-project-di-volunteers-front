import React, { useCallback, useEffect, useState } from 'react';
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

const BASE_URL = process.env.REACT_APP_BASE_URL;
const METHODS = ['espèces', 'chèque', 'virement', 'carte', 'autre'];
const today = () =>
  new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' });
// "2026-2027" from 1 September
export const currentSchoolYear = () => {
  const [y, m] = today().split('-').map(Number);
  return m >= 9 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
};
const frDay = (d) =>
  d ? new Date(`${d}T12:00:00Z`).toLocaleDateString('fr-FR') : '';

// Yearly membership fee (10 €), apart from the participation: a child
// taking part in the outings must be a member
const StudentMembership = ({ studentId, canEdit }) => {
  const year = currentSchoolYear();
  const [list, setList] = useState(null);
  const [form, setForm] = useState({
    amount: 10,
    method: 'espèces',
    paid_at: today(),
  });
  const load = useCallback(() => {
    axios
      .get(`${BASE_URL}/admin/students/${studentId}/cotisations`)
      .then(({ data }) => setList(data))
      .catch(() => setList([]));
  }, [studentId]);
  useEffect(load, [load]);
  const save = async () => {
    try {
      await axios.post(`${BASE_URL}/admin/students/${studentId}/cotisations`, {
        ...form,
        school_year: year,
      });
      toast.success('Cotisation enregistrée', { position: 'bottom-left' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Enregistrement impossible', {
        position: 'bottom-left',
      });
    }
  };
  const remove = async (m) => {
    try {
      await axios.delete(`${BASE_URL}/admin/cotisations/${m.id}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Suppression impossible', {
        position: 'bottom-left',
      });
    }
  };
  if (!list) return null;
  const current = list.find((m) => m.school_year === year);
  return (
    <Stack spacing={1.5}>
      {current ? (
        <Chip
          color="success"
          label={`${year} : à jour (${current.amount} €${current.paid_at ? `, le ${frDay(current.paid_at)}` : ''})`}
          sx={{ alignSelf: 'flex-start' }}
        />
      ) : (
        <Chip
          color="warning"
          variant="outlined"
          label={`${year} : à demander`}
          sx={{ alignSelf: 'flex-start' }}
        />
      )}
      {!current && canEdit && (
        // Two by two: the block is narrow
        <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: '1fr 1fr' }}>
          <TextField
            size="small"
            type="number"
            label="Montant (€)"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            fullWidth
          />
          <TextField
            select
            size="small"
            label="Moyen"
            value={form.method}
            onChange={(e) => setForm({ ...form, method: e.target.value })}
            fullWidth>
            {METHODS.map((m) => (
              <MenuItem key={m} value={m}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            type="date"
            label="Payée le"
            value={form.paid_at}
            onChange={(e) => setForm({ ...form, paid_at: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <Button variant="outlined" onClick={save}>
            Enregistrer
          </Button>
        </Box>
      )}
      {list.length > 0 && (
        <Stack spacing={0.5}>
          {list.map((m) => (
            <Stack key={m.id} direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" sx={{ flex: 1 }}>
                {m.school_year} : {m.amount} €{m.method ? ` · ${m.method}` : ''}
                {m.paid_at ? ` · ${frDay(m.paid_at)}` : ''}
              </Typography>
              {canEdit && (
                <IconButton
                  size="small"
                  aria-label="Supprimer"
                  onClick={() => remove(m)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Stack>
          ))}
        </Stack>
      )}
    </Stack>
  );
};

export default StudentMembership;
