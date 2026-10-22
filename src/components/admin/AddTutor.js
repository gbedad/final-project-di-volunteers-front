import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SendIcon from '@mui/icons-material/Send';
import { isManager } from '../../js/roles';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const role = () => {
  try {
    return JSON.parse(localStorage.getItem('user'))?.user?.role;
  } catch {
    return null;
  }
};

const EMPTY = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  birth_date: '',
  status: 'Validé',
  send_access: false,
};

// "Ajouter un tuteur" on the tutors list (admins and superadmins): account
// without a password, access e-mail now or later from the tutor's page
export const AddTutorButton = ({ onCreated }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [existing, setExisting] = useState(null);
  const [busy, setBusy] = useState(false);
  if (!isManager(role())) return null;

  const set = (field) => (e) =>
    setForm((f) => ({
      ...f,
      [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    }));
  const openTutor = (id) =>
    navigate('/change-status', {
      state: { userId: id, userLogged: location.state?.userLogged },
    });
  const close = () => {
    setOpen(false);
    setForm(EMPTY);
    setExisting(null);
  };
  const valid =
    form.first_name.trim() &&
    form.last_name.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());

  const save = async () => {
    setBusy(true);
    setExisting(null);
    try {
      const { data } = await axios.post(`${BASE_URL}/admin/tutors`, form);
      toast.success(
        form.send_access && !data.access_sent
          ? "Tuteur créé, mais l'e-mail d'accès n'a pas pu partir : renvoyez-le depuis sa fiche"
          : data.access_sent
            ? "Tuteur créé, e-mail d'accès envoyé"
            : 'Tuteur créé, sans e-mail',
        { position: 'bottom-left', duration: 6000 }
      );
      close();
      onCreated?.();
      openTutor(data.id);
    } catch (err) {
      if (err.response?.status === 409) setExisting(err.response.data.user);
      else
        toast.error(err.response?.data?.error || "Le tuteur n'a pas pu être créé", {
          position: 'bottom-left',
        });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={<PersonAddIcon />}
        onClick={() => setOpen(true)}>
        Ajouter un tuteur
      </Button>
      <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
        <DialogTitle>Ajouter un tuteur</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                size="small"
                label="Prénom *"
                value={form.first_name}
                onChange={set('first_name')}
                fullWidth
              />
              <TextField
                size="small"
                label="Nom *"
                value={form.last_name}
                onChange={set('last_name')}
                fullWidth
              />
            </Stack>
            <TextField
              size="small"
              label="E-mail *"
              type="email"
              value={form.email}
              onChange={set('email')}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                size="small"
                label="Téléphone"
                value={form.phone}
                onChange={set('phone')}
                inputProps={{ inputMode: 'tel' }}
                fullWidth
              />
              <TextField
                size="small"
                label="Date de naissance"
                type="date"
                value={form.birth_date}
                onChange={set('birth_date')}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Stack>
            <RadioGroup
              value={form.status}
              onChange={set('status')}
              sx={{ gap: 1.5 }}>
              <FormControlLabel
                value="Validé"
                control={<Radio size="small" />}
                label={
                  <Typography variant="body2">
                    <b>Tuteur déjà en activité</b> (statut « Validé ») : on
                    peut créer ses binômes tout de suite. Ses documents (B3,
                    convention…) restent à fournir.
                  </Typography>
                }
              />
              <FormControlLabel
                value="A renseigner"
                control={<Radio size="small" />}
                label={
                  <Typography variant="body2">
                    <b>Nouveau candidat</b> (statut « À renseigner ») : il
                    suit le parcours habituel (premier contact, entretien,
                    documents).
                  </Typography>
                }
              />
            </RadioGroup>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={form.send_access}
                  onChange={set('send_access')}
                />
              }
              label={
                <Typography variant="body2">
                  Envoyer maintenant l'e-mail d'accès (choix du mot de passe).
                  Sinon, vous pourrez l'envoyer plus tard depuis sa fiche.
                </Typography>
              }
            />
            {existing && (
              <Alert
                severity="warning"
                action={
                  <Button
                    color="inherit"
                    size="small"
                    sx={{ whiteSpace: 'nowrap' }}
                    onClick={() => {
                      const id = existing.id;
                      close();
                      openTutor(id);
                    }}>
                    Ouvrir la fiche
                  </Button>
                }>
                Un compte existe déjà avec cet e-mail : {existing.first_name}{' '}
                {existing.last_name} ({existing.status || existing.role}).
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>Annuler</Button>
          <Button variant="contained" disabled={!valid || busy} onClick={save}>
            Créer le tuteur
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// On the tutor's page, while the account has no password yet
export const SendAccess = ({ userId }) => {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const send = async () => {
    setBusy(true);
    try {
      await axios.post(`${BASE_URL}/admin/tutors/${userId}/send-access`);
      setSent(true);
      toast.success("E-mail d'accès envoyé", { position: 'bottom-left' });
    } catch (err) {
      toast.error(err.response?.data?.error || "L'e-mail n'a pas pu être envoyé", {
        position: 'bottom-left',
      });
    } finally {
      setBusy(false);
    }
  };
  return (
    <Alert
      severity="info"
      sx={{ width: '100%' }}
      action={
        <Button
          color="inherit"
          size="small"
          startIcon={<SendIcon />}
          disabled={busy}
          onClick={send}>
          {sent ? 'Renvoyer' : "Envoyer l'accès"}
        </Button>
      }>
      {sent
        ? 'Lien envoyé, valable 7 jours.'
        : "Compte créé par l'équipe : pas encore de mot de passe."}
    </Alert>
  );
};
