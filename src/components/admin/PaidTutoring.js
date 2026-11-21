import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import {
  Alert,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import PageHeader from './PageHeader';
import PaidStudents from './PaidStudents';
import { isPayant } from '../../js/roles';

// Tutorat payant: its own space, apart from the free tutoring. Invoices carry
// no VAT. Amounts are entered in euros and sent in cents.
const BASE_URL = process.env.REACT_APP_BASE_URL;

const euro = (cents) =>
  `${(Number(cents || 0) / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
const frDay = (d) => (d ? new Date(`${String(d).slice(0, 10)}T12:00:00Z`).toLocaleDateString('fr-FR') : '');
const today = () => new Date().toISOString().slice(0, 10);
const toCents = (euros) => Math.round(Number(String(euros).replace(',', '.')) * 100);

const METHODS = ['virement', 'carte', 'cheque', 'especes', 'helloasso', 'autre'];

const errorOf = (err) => err?.response?.data?.error || err?.response?.data?.msg || 'Erreur';

// Same session check as the navbar: a valid token saved at login
const savedSession = () => {
  try {
    const token = localStorage.getItem('token');
    const session = JSON.parse(localStorage.getItem('user'));
    if (!token || !session?.user) return null;
    const { exp } = JSON.parse(atob(token.split('.')[1]));
    return exp * 1000 > Date.now() ? session : null;
  } catch {
    return null;
  }
};

const PaidTutoring = () => {
  const location = useLocation();
  const userLogged = location.state?.userLogged || savedSession();
  const role = userLogged?.user?.role;
  const [tab, setTab] = useState(0);
  const [factures, setFactures] = useState([]);
  const [payeurs, setPayeurs] = useState([]);
  const [dialog, setDialog] = useState(null); // { kind, facture? }
  const [form, setForm] = useState({});

  const load = useCallback(() => {
    axios
      .get(`${BASE_URL}/payant/factures`)
      .then((r) => setFactures(r.data))
      .catch((e) => toast.error(errorOf(e)));
    axios
      .get(`${BASE_URL}/payant/payeurs`)
      .then((r) => setPayeurs(r.data))
      .catch((e) => toast.error(errorOf(e)));
  }, []);

  useEffect(() => {
    if (isPayant(role)) load();
  }, [role, load]);

  if (!isPayant(role)) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">Cet espace est réservé à la gestion du tutorat payant.</Alert>
      </Container>
    );
  }

  const open = (kind, facture) => {
    const defaults = {
      invoice: { payeur_id: payeurs[0]?.id || '', issued_on: today(), label: 'Tutorat', amount: '' },
      payment: { paid_on: today(), amount: '', method: 'virement', reference: '' },
      avoir: { issued_on: today() },
      payeur: { type: 'famille', name: '', email: '', address: '' },
    };
    setForm(defaults[kind]);
    setDialog({ kind, facture });
  };

  const close = () => setDialog(null);

  const submit = async () => {
    try {
      if (dialog.kind === 'invoice') {
        await axios.post(`${BASE_URL}/payant/factures`, {
          payeur_id: Number(form.payeur_id),
          issued_on: form.issued_on,
          label: form.label,
          amount_cents: toCents(form.amount),
        });
        toast.success('Facture émise');
      } else if (dialog.kind === 'payment') {
        await axios.post(`${BASE_URL}/payant/factures/${dialog.facture.id}/paiements`, {
          paid_on: form.paid_on,
          amount_cents: toCents(form.amount),
          method: form.method,
          reference: form.reference || null,
        });
        toast.success('Paiement enregistré');
      } else if (dialog.kind === 'avoir') {
        await axios.post(`${BASE_URL}/payant/factures/${dialog.facture.id}/avoir`, {
          issued_on: form.issued_on,
        });
        toast.success('Avoir émis, facture annulée');
      } else if (dialog.kind === 'payeur') {
        await axios.post(`${BASE_URL}/payant/payeurs`, form);
        toast.success('Payeur créé');
      }
      close();
      load();
    } catch (e) {
      toast.error(errorOf(e));
    }
  };

  const reste = (f) => Number(f.amount_cents) - Number(f.paid_cents || 0);

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <PageHeader
        title="Tutorat payant"
        subtitle="Espace séparé du bénévolat. Factures sans TVA ; les paiements se font en dehors (virement, HelloAsso…)."
        actions={
          tab === 0 ? (
            <Button variant="contained" onClick={() => open('invoice')} disabled={!payeurs.length}>
              Nouvelle facture
            </Button>
          ) : tab === 1 ? (
            <Button variant="contained" onClick={() => open('payeur')}>
              Nouveau payeur
            </Button>
          ) : null
        }
      />
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label={`Factures (${factures.length})`} />
        <Tab label={`Payeurs (${payeurs.length})`} />
        <Tab label="Élèves et binômes" />
      </Tabs>
      {tab === 2 && <PaidStudents />}

      {tab === 0 && (
        <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Numéro</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Payeur</TableCell>
                <TableCell>Libellé</TableCell>
                <TableCell align="right">Montant</TableCell>
                <TableCell align="right">Reste dû</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {factures.map((f) => (
                <TableRow key={f.id} hover>
                  <TableCell>{f.numero}</TableCell>
                  <TableCell>{frDay(f.issued_on)}</TableCell>
                  <TableCell>{f.payeur_name}</TableCell>
                  <TableCell>{f.label}</TableCell>
                  <TableCell align="right">{euro(f.amount_cents)}</TableCell>
                  <TableCell align="right">{f.status === 'emise' && !f.cancels_facture_id ? euro(reste(f)) : '—'}</TableCell>
                  <TableCell>
                    {f.cancels_facture_id ? (
                      <Chip size="small" label="Avoir" />
                    ) : f.status === 'annulee' ? (
                      <Chip size="small" color="default" label="Annulée" />
                    ) : reste(f) <= 0 ? (
                      <Chip size="small" color="success" label="Payée" />
                    ) : (
                      <Chip size="small" color="warning" label="À payer" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {f.status === 'emise' && !f.cancels_facture_id && (
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button size="small" disabled={reste(f) <= 0} onClick={() => open('payment', f)}>
                          Paiement
                        </Button>
                        <Button size="small" color="error" onClick={() => open('avoir', f)}>
                          Avoir
                        </Button>
                      </Stack>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!factures.length && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Typography variant="body2" color="text.secondary">
                      Aucune facture pour l’instant.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      )}

      {tab === 1 && (
        <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>E-mail</TableCell>
                <TableCell>Identifiant compta</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payeurs.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.type === 'famille' ? 'Famille' : 'Élève majeur'}</TableCell>
                  <TableCell>{p.email}</TableCell>
                  <TableCell>{p.accounting_tiers_id || <Chip size="small" label="À créer" />}</TableCell>
                </TableRow>
              ))}
              {!payeurs.length && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography variant="body2" color="text.secondary">
                      Aucun payeur pour l’instant.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Dialog open={!!dialog} onClose={close} fullWidth maxWidth="xs">
        <DialogTitle>
          {dialog?.kind === 'invoice' && 'Nouvelle facture'}
          {dialog?.kind === 'payment' && `Paiement sur ${dialog.facture?.numero}`}
          {dialog?.kind === 'avoir' && `Annuler ${dialog.facture?.numero} par un avoir`}
          {dialog?.kind === 'payeur' && 'Nouveau payeur'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {dialog?.kind === 'invoice' && (
              <>
                <TextField select label="Payeur" value={form.payeur_id ?? ''} onChange={(e) => setForm({ ...form, payeur_id: e.target.value })}>
                  {payeurs.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField type="date" label="Date d’émission" InputLabelProps={{ shrink: true }} value={form.issued_on || ''} onChange={(e) => setForm({ ...form, issued_on: e.target.value })} />
                <TextField label="Libellé" value={form.label || ''} onChange={(e) => setForm({ ...form, label: e.target.value })} />
                <TextField label="Montant (€)" inputMode="decimal" value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </>
            )}
            {dialog?.kind === 'payment' && (
              <>
                <TextField type="date" label="Date du paiement" InputLabelProps={{ shrink: true }} value={form.paid_on || ''} onChange={(e) => setForm({ ...form, paid_on: e.target.value })} />
                <TextField label="Montant (€)" inputMode="decimal" helperText={`Reste dû : ${euro(reste(dialog.facture))}`} value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                <TextField select label="Moyen" value={form.method || ''} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                  {METHODS.map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField label="Référence (facultatif)" value={form.reference || ''} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
              </>
            )}
            {dialog?.kind === 'avoir' && (
              <>
                <Alert severity="warning">
                  La facture de {euro(dialog.facture?.amount_cents)} est annulée par un avoir du même montant. Ce n’est pas réversible.
                </Alert>
                <TextField type="date" label="Date de l’avoir" InputLabelProps={{ shrink: true }} value={form.issued_on || ''} onChange={(e) => setForm({ ...form, issued_on: e.target.value })} />
              </>
            )}
            {dialog?.kind === 'payeur' && (
              <>
                <TextField select label="Type" value={form.type || 'famille'} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <MenuItem value="famille">Famille</MenuItem>
                  <MenuItem value="eleve_majeur">Élève majeur</MenuItem>
                </TextField>
                <TextField label="Nom" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <TextField label="E-mail" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <TextField label="Adresse" multiline minRows={2} value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>Annuler</Button>
          <Button variant="contained" onClick={submit}>
            Valider
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PaidTutoring;
