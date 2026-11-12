import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import SignaturePad from '../application/SignaturePad';
import { BASE_URL } from './activityUtils';

// The parent authorises the outing, on their phone, through a personal link
const OutingConsentPage = () => {
  const { token } = useParams();
  const [page, setPage] = useState(null);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    signer_name: '',
    relation: '',
    choices: {},
    arrival: '',
    departure: '',
    emergency_phone: '',
  });
  const [signature, setSignature] = useState(null);
  const [busy, setBusy] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [done, setDone] = useState(null);
  useEffect(() => {
    axios
      .get(`${BASE_URL}/autorisation-sortie/${token}`)
      .then(({ data }) => {
        setPage(data);
        setForm((f) => ({
          ...f,
          signer_name: [data.parent.first_name, data.parent.last_name]
            .filter(Boolean)
            .join(' '),
          emergency_phone: data.phone || '',
        }));
      })
      .catch((err) =>
        setError(err.response?.data?.error || 'Page indisponible')
      );
  }, [token]);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const tick = (id) => (e) =>
    setForm((f) => ({
      ...f,
      choices: { ...f.choices, [id]: e.target.checked },
    }));
  const send = async () => {
    setBusy(true);
    setSendError(null);
    try {
      const { data } = await axios.post(
        `${BASE_URL}/autorisation-sortie/${token}`,
        { ...form, signature }
      );
      setDone(data);
    } catch (err) {
      setSendError(
        err.response?.data?.error ||
          "L'autorisation n'a pas pu être enregistrée"
      );
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="warning">{error}</Alert>
      </Container>
    );
  }
  if (!page) return <LinearProgress sx={{ mt: 4 }} />;
  const a = page.activity;
  const header = (
    <Box>
      <Typography variant="overline" color="text.secondary">
        Association Séphora Berrebi · sortie culturelle
      </Typography>
      <Typography variant="h5" component="h1">
        {a.title}
      </Typography>
      <Typography
        color="text.secondary"
        sx={{ '&::first-letter': { textTransform: 'uppercase' } }}>
        {a.when}
      </Typography>
      {a.place && <Typography variant="body2">{a.place}</Typography>}
    </Box>
  );
  if (done || page.state === 'signed') {
    return (
      <Container maxWidth="sm" sx={{ mt: 3, mb: 6 }}>
        <Stack spacing={2}>
          {header}
          <Alert severity="success">
            Merci, votre autorisation pour {page.child} est enregistrée.
            {done?.copy_sent
              ? ' Votre exemplaire vous a été envoyé par e-mail.'
              : ''}
          </Alert>
        </Stack>
      </Container>
    );
  }
  if (page.state !== 'pending') {
    return (
      <Container maxWidth="sm" sx={{ mt: 3 }}>
        <Stack spacing={2}>
          {header}
          <Alert severity="warning">
            {page.state === 'expired'
              ? 'Ce lien a expiré. Demandez-en un nouveau à l’association.'
              : 'Cette inscription a été annulée.'}
          </Alert>
        </Stack>
      </Container>
    );
  }
  const required = page.items.filter((i) => i.required);
  const ready =
    form.signer_name.trim() &&
    form.relation &&
    required.every((i) => form.choices[i.id]) &&
    form.arrival &&
    form.departure &&
    form.emergency_phone.replace(/\D/g, '').length >= 9 &&
    signature;
  const rdv = [
    a.meeting_point &&
      `${a.meeting_point}${a.meeting_time ? ` à ${a.meeting_time}` : ''}`,
    a.meeting_point2 &&
      `${a.meeting_point2}${a.meeting_time2 ? ` à ${a.meeting_time2}` : ''}`,
  ].filter(Boolean);
  const Ways = ({ field, label, options }) => (
    <Box>
      <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
        {label}
      </Typography>
      <ToggleButtonGroup
        exclusive
        fullWidth
        size="small"
        color="primary"
        value={form[field]}
        onChange={(e, v) => v && setForm((f) => ({ ...f, [field]: v }))}>
        {options.map(([value, text]) => (
          <ToggleButton
            key={value}
            value={value}
            sx={{ textTransform: 'none' }}>
            {text}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );

  return (
    <Container maxWidth="sm" sx={{ mt: 3, mb: 6 }}>
      <Stack spacing={2.5}>
        {header}
        {(rdv.length > 0 || a.bring) && (
          <Paper variant="outlined" sx={{ p: 1.5 }}>
            {rdv.length > 0 && (
              <Typography variant="body2">
                <b>Rendez-vous :</b> {rdv.join(' ou ')}
              </Typography>
            )}
            {a.bring && (
              <Typography variant="body2">
                <b>À apporter :</b> {a.bring}
              </Typography>
            )}
          </Paper>
        )}
        <Typography>
          Pour que <b>{page.child}</b> participe, merci de lire, cocher et
          signer (2 minutes).
        </Typography>
        <Stack spacing={1}>
          {page.items.map((i) => (
            <Paper key={i.id} variant="outlined" sx={{ p: 1.5 }}>
              <FormControlLabel
                sx={{ alignItems: 'flex-start', m: 0 }}
                control={
                  <Checkbox
                    checked={!!form.choices[i.id]}
                    onChange={tick(i.id)}
                    sx={{ mt: -0.75 }}
                  />
                }
                label={
                  <Box>
                    <Typography fontWeight={600}>
                      {i.title}
                      {i.required ? '' : ' (facultatif)'}
                    </Typography>
                    <Typography variant="body2">{i.text}</Typography>
                  </Box>
                }
              />
            </Paper>
          ))}
        </Stack>
        <Ways
          field="arrival"
          label={`Pour venir au rendez-vous, ${page.child} :`}
          options={[
            ['accompagné', 'sera accompagné(e) d’un adulte'],
            ['seul', 'viendra seul(e)'],
          ]}
        />
        <Ways
          field="departure"
          label="À la fin de la sortie :"
          options={[
            ['accompagné', 'un adulte viendra le/la chercher'],
            ['seul', 'il/elle repartira seul(e)'],
          ]}
        />
        <TextField
          label="Téléphone joignable pendant la sortie"
          value={form.emergency_phone}
          onChange={set('emergency_phone')}
          inputProps={{ inputMode: 'tel' }}
        />
        <TextField
          label="Votre nom"
          value={form.signer_name}
          onChange={set('signer_name')}
        />
        <TextField
          select
          label="Vous êtes"
          value={form.relation}
          onChange={set('relation')}>
          {page.relations.map((r) => (
            <MenuItem key={r} value={r}>
              {r}
            </MenuItem>
          ))}
        </TextField>
        <Box>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
            Votre signature
          </Typography>
          <SignaturePad onChange={setSignature} />
        </Box>
        {sendError && <Alert severity="error">{sendError}</Alert>}
        <Button
          size="large"
          variant="contained"
          disabled={!ready || busy}
          onClick={send}>
          Signer l'autorisation
        </Button>
        {!ready && (
          <Typography variant="caption" color="text.secondary">
            Les trois premières cases, l'arrivée et le départ, un téléphone,
            votre nom, votre lien avec l'enfant et votre signature sont
            nécessaires.
          </Typography>
        )}
      </Stack>
    </Container>
  );
};

export default OutingConsentPage;
