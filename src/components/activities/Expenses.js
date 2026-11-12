import React, { useState } from 'react';
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
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import {
  BASE_URL,
  PAYMENT_METHODS,
  durationText,
  euros,
  today,
} from './activityUtils';

const toastError = (err, text) =>
  toast.error(err.response?.data?.error || text, { position: 'bottom-left' });
const frDay = (d) =>
  d ? new Date(`${d}T12:00:00Z`).toLocaleDateString('fr-FR') : '';
const methodLabel = (m) =>
  PAYMENT_METHODS.find((x) => x.value === m)?.label || m || '';
const readFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
export const openReceipt = async (id) => {
  try {
    const { data } = await axios.get(
      `${BASE_URL}/admin/depenses/${id}/justificatif`
    );
    window.open(data.url, '_blank');
  } catch (err) {
    toastError(err, 'Justificatif indisponible');
  }
};

// One expense: what, how much, who paid, how, when, to whom, accounting
const ExpenseDialog = ({ a, expense, onClose, onSaved }) => {
  const [form, setForm] = useState(
    expense || {
      label: '',
      amount: '',
      paid_by: '',
      method: 'carte',
      paid_on: today(),
      beneficiary: '',
      to_refund: false,
      accounting_label: '',
    }
  );
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const save = async () => {
    setBusy(true);
    try {
      const body = {
        label: form.label,
        amount: form.amount,
        paid_by: form.paid_by,
        method: form.method,
        paid_on: form.paid_on,
        beneficiary: form.beneficiary,
        to_refund: !!form.to_refund,
        // Empty: proposed by the server ("AC_Schubert_7tickets_remboursement")
        ...(form.accounting_label
          ? { accounting_label: form.accounting_label }
          : {}),
      };
      const { data } = expense
        ? await axios.patch(`${BASE_URL}/admin/depenses/${expense.id}`, body)
        : await axios.post(
            `${BASE_URL}/admin/activites/${a.id}/depenses`,
            body
          );
      if (file) {
        await axios.post(`${BASE_URL}/admin/depenses/${data.id}/justificatif`, {
          file: await readFile(file),
          name: file.name,
        });
      }
      onSaved();
    } catch (err) {
      toastError(err, "La dépense n'a pas pu être enregistrée");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {expense ? 'Modifier la dépense' : 'Nouvelle dépense'}
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            mt: 1,
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          }}>
          <TextField
            size="small"
            label="Description"
            placeholder="Ex. : 7 billets"
            value={form.label}
            onChange={set('label')}
            sx={{ gridColumn: { sm: '1 / -1' } }}
          />
          <TextField
            size="small"
            type="number"
            label="Montant (€)"
            value={form.amount}
            onChange={set('amount')}
            inputProps={{ min: 0, step: 0.01 }}
          />
          <TextField
            size="small"
            label="Bénéficiaire"
            placeholder="Ex. : Théâtre du Châtelet"
            value={form.beneficiary || ''}
            onChange={set('beneficiary')}
          />
          <TextField
            size="small"
            label="Payé par"
            placeholder="Ex. : Emmanuelle B. ou l'association"
            value={form.paid_by || ''}
            onChange={set('paid_by')}
          />
          <TextField
            select
            size="small"
            label="Moyen de paiement"
            value={form.method || ''}
            onChange={set('method')}>
            {PAYMENT_METHODS.map((m) => (
              <MenuItem key={m.value} value={m.value}>
                {m.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            type="date"
            label="Date"
            value={form.paid_on || ''}
            onChange={set('paid_on')}
            InputLabelProps={{ shrink: true }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={!!form.to_refund}
                onChange={(e) =>
                  setForm((f) => ({ ...f, to_refund: e.target.checked }))
                }
              />
            }
            label="Avancé par un bénévole : à rembourser"
          />
          <TextField
            size="small"
            label="Libellé comptable"
            value={form.accounting_label || ''}
            onChange={set('accounting_label')}
            helperText={
              expense
                ? ''
                : 'Vide : proposé automatiquement (AC_Sortie_dépense_remboursement)'
            }
            sx={{ gridColumn: { sm: '1 / -1' } }}
          />
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ gridColumn: { sm: '1 / -1' } }}>
            <Button
              component="label"
              size="small"
              variant="outlined"
              startIcon={<AttachFileIcon />}>
              {file
                ? file.name
                : expense?.receipt_name
                  ? 'Remplacer le justificatif'
                  : 'Joindre le justificatif'}
              <input
                hidden
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </Button>
            {expense?.receipt_key && !file && (
              <Button size="small" onClick={() => openReceipt(expense.id)}>
                Voir
              </Button>
            )}
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          variant="contained"
          disabled={busy || !form.label.trim() || form.amount === ''}
          onClick={save}>
          Enregistrer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

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

// Budget tab: the expenses, then the figures
export const BudgetPanel = ({ a, canEdit, reload }) => {
  const [editing, setEditing] = useState(null);
  const remove = async (e) => {
    try {
      await axios.delete(`${BASE_URL}/admin/depenses/${e.id}`);
      reload();
    } catch (err) {
      toastError(err, "La dépense n'a pas pu être supprimée");
    }
  };
  const b = a.budget;
  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1 }}>
          <Typography fontWeight={600}>Dépenses</Typography>
          {canEdit && (
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setEditing('new')}>
              Ajouter
            </Button>
          )}
        </Stack>
        {!a.expenses.length && (
          <Typography variant="body2" color="text.secondary">
            Aucune dépense saisie.
          </Typography>
        )}
        <Stack divider={<Divider />}>
          {a.expenses.map((e) => (
            <Stack
              key={e.id}
              direction="row"
              spacing={1}
              alignItems="flex-start"
              sx={{ py: 1 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                  useFlexGap>
                  <Typography fontWeight={600}>{e.label}</Typography>
                  {e.to_refund && (
                    <Chip
                      size="small"
                      color={e.refunded_at ? 'success' : 'warning'}
                      label={
                        e.refunded_at
                          ? `Remboursé le ${frDay(e.refunded_at)}`
                          : 'À rembourser'
                      }
                    />
                  )}
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {[
                    e.beneficiary,
                    e.paid_by && `payé par ${e.paid_by}`,
                    methodLabel(e.method),
                    frDay(e.paid_on),
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </Typography>
                {e.accounting_label && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {e.accounting_label}
                  </Typography>
                )}
              </Box>
              <Typography
                fontWeight={600}
                sx={{
                  fontVariantNumeric: 'tabular-nums',
                  whiteSpace: 'nowrap',
                }}>
                {euros(e.amount)}
              </Typography>
              {e.receipt_key && (
                <IconButton
                  size="small"
                  aria-label="Justificatif"
                  title="Voir le justificatif"
                  onClick={() => openReceipt(e.id)}>
                  <AttachFileIcon fontSize="small" />
                </IconButton>
              )}
              {canEdit && (
                <>
                  <IconButton
                    size="small"
                    aria-label="Modifier"
                    onClick={() => setEditing(e)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    aria-label="Supprimer"
                    onClick={() => remove(e)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </>
              )}
            </Stack>
          ))}
        </Stack>
      </Paper>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Row label="Coût total" value={euros(b.costs)} strong />
        {b.per_student !== null && (
          <Row label="Coût par enfant inscrit" value={euros(b.per_student)} />
        )}
        {b.to_refund > 0 && (
          <Row
            label="Reste à rembourser aux bénévoles"
            value={euros(b.to_refund)}
          />
        )}
        <Divider sx={{ my: 1 }} />
        <Row
          label="Participations attendues"
          value={euros(b.expected)}
          hint={`${euros(a.fee)} par enfant, sauf exceptions`}
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
        <Divider sx={{ my: 1 }} />
        <Row
          label="Temps bénévole"
          value={durationText(a.volunteer_minutes)}
          hint="Saisi dans l'onglet Infos"
        />
      </Paper>
      {editing && (
        <ExpenseDialog
          a={a}
          expense={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
        />
      )}
    </Stack>
  );
};

// What the treasurer has to refund, every outing together
export const RefundsList = ({ manager }) => {
  const [items, setItems] = useState(null);
  const load = () =>
    axios
      .get(`${BASE_URL}/admin/remboursements`)
      .then(({ data }) => setItems(data))
      .catch(() => setItems([]));
  React.useEffect(() => {
    load();
  }, []);
  const mark = async (e, refunded) => {
    try {
      await axios.patch(`${BASE_URL}/admin/depenses/${e.id}/rembourse`, {
        refunded,
      });
      load();
    } catch (err) {
      toastError(err, "Le remboursement n'a pas pu être enregistré");
    }
  };
  if (!items) return null;
  const waiting = items.filter((e) => !e.refunded_at);
  const total = waiting.reduce((n, e) => n + e.amount, 0);
  return (
    <Stack spacing={1.5}>
      <Typography variant="body2">
        {waiting.length ? (
          <>
            <b>{euros(total)}</b> à rembourser ({waiting.length} dépense
            {waiting.length > 1 ? 's' : ''} avancée
            {waiting.length > 1 ? 's' : ''} par des bénévoles).
          </>
        ) : (
          'Rien à rembourser.'
        )}
      </Typography>
      {!manager && waiting.length > 0 && (
        <Alert severity="info">
          Le trésorier (un admin) marque les dépenses remboursées.
        </Alert>
      )}
      {items.map((e) => (
        <Paper
          key={e.id}
          variant="outlined"
          sx={{ p: 1.5, opacity: e.refunded_at ? 0.65 : 1 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            justifyContent="space-between">
            <Box sx={{ minWidth: 0 }}>
              <Typography fontWeight={600}>
                {e.paid_by || 'Bénévole ?'} · {euros(e.amount)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {e.activity_title} : {e.label}
                {e.beneficiary ? ` (${e.beneficiary})` : ''} ·{' '}
                {methodLabel(e.method)} {frDay(e.paid_on)}
              </Typography>
              {e.accounting_label && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {e.accounting_label}
                </Typography>
              )}
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              {e.receipt_key ? (
                <Button
                  size="small"
                  startIcon={<AttachFileIcon />}
                  onClick={() => openReceipt(e.id)}>
                  Justificatif
                </Button>
              ) : (
                <Chip
                  size="small"
                  variant="outlined"
                  color="warning"
                  label="Sans justificatif"
                />
              )}
              {e.refunded_at ? (
                <Chip
                  size="small"
                  color="success"
                  label={`Remboursé le ${frDay(e.refunded_at)}`}
                  onDelete={manager ? () => mark(e, false) : undefined}
                />
              ) : (
                manager && (
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => mark(e, true)}>
                    Remboursé
                  </Button>
                )
              )}
            </Stack>
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
};
