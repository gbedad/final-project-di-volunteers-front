import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const euro = (n) =>
  `${Number(n || 0).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} €`;
const frDay = (d) =>
  d
    ? new Date(`${String(d).slice(0, 10)}T12:00:00Z`).toLocaleDateString(
        'fr-FR'
      )
    : '';
const today = () =>
  new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' });
export const STATUS = {
  payé: { color: 'success', variant: 'filled' },
  'à payer': { color: 'warning', variant: 'outlined' },
  'en retard': { color: 'error', variant: 'filled' },
  'à venir': { color: 'default', variant: 'outlined' },
  reçue: { color: 'success', variant: 'filled' },
  rendue: { color: 'default', variant: 'filled' },
  encaissée: { color: 'info', variant: 'filled' },
};
const NATURE_LABELS = {
  cotisation: 'Cotisation',
  participation: 'Participation',
  forfait: 'Forfait',
  caution: 'Caution',
};
const lineText = (l) =>
  `${NATURE_LABELS[l.nature] || l.nature}${
    l.nature === 'participation' && l.term ? ` ${l.term.slice(-2)}` : ''
  }${l.nature === 'forfait' && l.hours ? ` ${Number(l.hours)} h` : ''} ${euro(l.amount)}`;

// One collection, split among what it pays (an AssoConnect link often
// covers the membership and a term together)
const PaymentDialog = ({ studentId, account, onClose, onSaved }) => {
  // Terms before the tracking in the application come last, unticked
  const open = [
    ...account.items.filter(
      (i) =>
        i.status !== 'payé' &&
        !['reçue', 'rendue', 'encaissée'].includes(i.status)
    ),
    ...(account.earlier || []),
  ];
  const [picked, setPicked] = useState(
    Object.fromEntries(
      open.map((i, k) => [
        k,
        {
          on: !['à venir', 'antérieur'].includes(i.status),
          amount: Math.max(0, i.due - i.paid),
          packs: 1,
        },
      ])
    )
  );
  const [form, setForm] = useState({
    method: 'assoconnect',
    paid_at: today(),
    reference: '',
    note: '',
  });
  const [busy, setBusy] = useState(false);
  const lines = open
    .map((i, k) => ({ i, p: picked[k] }))
    .filter(({ p }) => p.on && Number(p.amount) > 0)
    .map(({ i, p }) => ({
      nature: i.nature,
      term: i.term,
      hours: i.nature === 'forfait' ? 5 * (Number(p.packs) || 1) : undefined,
      amount:
        i.nature === 'forfait'
          ? Number(i.due) * (Number(p.packs) || 1)
          : Number(p.amount),
    }));
  const total = lines.reduce((n, l) => n + l.amount, 0);
  const set = (k, v) => setPicked((x) => ({ ...x, [k]: { ...x[k], ...v } }));
  const save = async () => {
    setBusy(true);
    try {
      await axios.post(`${BASE_URL}/admin/students/${studentId}/paiements`, {
        ...form,
        lines,
      });
      toast.success('Paiement enregistré', { position: 'bottom-left' });
      onSaved();
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Le paiement n'a pas pu être enregistré",
        { position: 'bottom-left' }
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Enregistrer un paiement</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} sx={{ mt: 0.5 }}>
          <Typography variant="body2" fontWeight={600}>
            Ce que le paiement règle
          </Typography>
          {!open.length && (
            <Typography variant="body2" color="text.secondary">
              Rien n'est dû pour l'instant.
            </Typography>
          )}
          {open.map((i, k) => (
            <Stack key={k} direction="row" spacing={1} alignItems="center">
              <FormControlLabel
                sx={{ flex: 1, mr: 0 }}
                control={
                  <Checkbox
                    checked={picked[k].on}
                    onChange={(e) => set(k, { on: e.target.checked })}
                  />
                }
                label={
                  <Typography variant="body2">
                    {i.label}
                    {i.status === 'à venir' ? ' (d’avance)' : ''}
                    {i.status === 'antérieur' ? ' (déjà réglé, à saisir)' : ''}
                  </Typography>
                }
              />
              {i.nature === 'forfait' ? (
                <TextField
                  select
                  size="small"
                  label="Forfaits"
                  value={picked[k].packs}
                  onChange={(e) => set(k, { packs: e.target.value })}
                  sx={{ width: 140 }}>
                  {[1, 2, 3, 4].map((n) => (
                    <MenuItem key={n} value={n}>
                      {n} × 5 h ({euro(i.due * n)})
                    </MenuItem>
                  ))}
                </TextField>
              ) : (
                <TextField
                  size="small"
                  type="number"
                  label="€"
                  value={picked[k].amount}
                  onChange={(e) => set(k, { amount: e.target.value })}
                  sx={{ width: 100 }}
                  inputProps={{ min: 0, step: 0.5 }}
                />
              )}
            </Stack>
          ))}
          <Divider />
          <Typography fontWeight={600}>Total : {euro(total)}</Typography>
          <Box
            sx={{
              display: 'grid',
              gap: 1.5,
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            }}>
            <TextField
              select
              size="small"
              label="Moyen"
              value={form.method}
              onChange={(e) => setForm({ ...form, method: e.target.value })}>
              {account.methods.map((m) => (
                <MenuItem key={m.value} value={m.value}>
                  {m.label}
                  {m.exceptional ? ' (exceptionnel)' : ''}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              type="date"
              label="Payé le"
              value={form.paid_at}
              onChange={(e) => setForm({ ...form, paid_at: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              size="small"
              label="Référence (n° AssoConnect, de chèque…)"
              value={form.reference}
              onChange={(e) => setForm({ ...form, reference: e.target.value })}
            />
            <TextField
              size="small"
              label="Note"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          variant="contained"
          disabled={busy || !lines.length}
          onClick={save}>
          Enregistrer {total ? euro(total) : ''}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// What the family owes and paid this school year (admins)
const StudentPayments = ({ studentId, refresh }) => {
  const [account, setAccount] = useState(null);
  const [paying, setPaying] = useState(false);
  const [menu, setMenu] = useState(null);
  const load = useCallback(() => {
    axios
      .get(`${BASE_URL}/admin/students/${studentId}/compte`)
      .then(({ data }) => setAccount(data))
      .catch(() => setAccount(null));
  }, [studentId]);
  // Again when the participation changes (QF saved)
  useEffect(load, [load, refresh]);
  if (!account) return null;
  const act = async (fn, error) => {
    try {
      await fn();
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || error, {
        position: 'bottom-left',
      });
    }
  };
  const methodLabel = (v) =>
    account.methods.find((m) => m.value === v) || {
      label: v,
      exceptional: true,
    };
  return (
    <Stack spacing={1.25}>
      <Divider />
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography fontWeight={600}>Paiements {account.year}</Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setPaying(true)}>
          Enregistrer un paiement
        </Button>
      </Stack>
      {!account.began && (
        <Typography variant="caption" color="text.secondary">
          La participation et la caution sont dues à partir du début du tutorat.
        </Typography>
      )}
      {account.earlier?.length > 0 && (
        <Typography variant="caption" color="text.secondary">
          Le 1er trimestre n'est pas réclamé (suivi dans l'Excel) ; un paiement
          déjà reçu peut être saisi dans « Enregistrer un paiement ».
        </Typography>
      )}
      {account.hourly && (
        <Typography variant="body2">
          Forfaits : {account.hourly.done} h faites sur {account.hourly.bought}{' '}
          h payées
          {account.hourly.left > 0 ? ` (reste ${account.hourly.left} h)` : ''}
        </Typography>
      )}
      <Stack spacing={0.5}>
        {account.items.map((i, k) => (
          <Stack key={k} direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }}>
              {i.label}
              <Typography
                component="span"
                variant="body2"
                color="text.secondary">
                {' '}
                · {euro(i.due)}
                {i.paid && i.paid < i.due ? ` (payé ${euro(i.paid)})` : ''}
              </Typography>
            </Typography>
            <Chip
              size="small"
              color={STATUS[i.status]?.color}
              variant={STATUS[i.status]?.variant}
              label={i.status}
            />
            {i.nature === 'caution' && i.line_id ? (
              <IconButton
                size="small"
                aria-label="Devenir de la caution"
                onClick={(e) =>
                  setMenu({ el: e.currentTarget, id: i.line_id })
                }>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            ) : null}
          </Stack>
        ))}
      </Stack>
      <Menu anchorEl={menu?.el} open={!!menu} onClose={() => setMenu(null)}>
        {['reçue', 'rendue', 'encaissée'].map((s) => (
          <MenuItem
            key={s}
            onClick={() => {
              const id = menu.id;
              setMenu(null);
              act(
                () =>
                  axios.patch(
                    `${BASE_URL}/admin/lignes-paiement/${id}/caution`,
                    { status: s }
                  ),
                'Enregistrement impossible'
              );
            }}>
            Caution {s}
          </MenuItem>
        ))}
      </Menu>
      {account.payments.length > 0 && (
        <Stack spacing={0.5}>
          <Typography variant="caption" color="text.secondary">
            Encaissements
          </Typography>
          {account.payments.map((p) => {
            const m = methodLabel(p.method);
            return (
              <Stack key={p.id} direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }}>
                  {frDay(p.paid_at)} · <b>{euro(p.amount)}</b> · {m.label}
                  {m.exceptional ? ' (exceptionnel)' : ''}
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                    display="block">
                    {(p.lines || []).map(lineText).join(' + ')}
                    {p.reference ? ` · réf. ${p.reference}` : ''}
                  </Typography>
                </Typography>
                <IconButton
                  size="small"
                  aria-label="Supprimer"
                  title="Supprimer (saisie erronée)"
                  onClick={() =>
                    act(
                      () => axios.delete(`${BASE_URL}/admin/paiements/${p.id}`),
                      'Suppression impossible'
                    )
                  }>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            );
          })}
        </Stack>
      )}
      {paying && (
        <PaymentDialog
          studentId={studentId}
          account={account}
          onClose={() => setPaying(false)}
          onSaved={() => {
            setPaying(false);
            load();
          }}
        />
      )}
    </Stack>
  );
};

export default StudentPayments;
