import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import logo from '../assets/LogoASB.png';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const frDate = (d) => new Date(d).toLocaleDateString('fr-FR');

// Signature drawn with a finger or the mouse
const SignaturePad = ({ onChange }) => {
  const canvas = useRef(null);
  const drawing = useRef(false);
  const empty = useRef(true);

  useEffect(() => {
    const c = canvas.current;
    const ratio = window.devicePixelRatio || 1;
    c.width = c.offsetWidth * ratio;
    c.height = c.offsetHeight * ratio;
    const ctx = c.getContext('2d');
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1a2a6c';
  }, []);

  const point = (e) => {
    const r = canvas.current.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };
  const start = (e) => {
    e.preventDefault();
    canvas.current.setPointerCapture(e.pointerId);
    drawing.current = true;
    const ctx = canvas.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(...point(e));
  };
  const move = (e) => {
    if (!drawing.current) return;
    const ctx = canvas.current.getContext('2d');
    ctx.lineTo(...point(e));
    ctx.stroke();
    empty.current = false;
  };
  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    onChange(empty.current ? null : canvas.current.toDataURL('image/png'));
  };
  const clear = () => {
    const c = canvas.current;
    c.getContext('2d').clearRect(0, 0, c.width, c.height);
    empty.current = true;
    onChange(null);
  };

  return (
    <Box>
      <Box
        component="canvas"
        ref={canvas}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        sx={{
          width: '100%',
          height: 160,
          border: '1px dashed',
          borderColor: 'grey.500',
          borderRadius: 1,
          bgcolor: '#fff',
          touchAction: 'none',
          cursor: 'crosshair',
          display: 'block',
        }}
      />
      <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          Signez avec le doigt ou la souris
        </Typography>
        <Button size="small" onClick={clear}>
          Effacer
        </Button>
      </Stack>
    </Box>
  );
};

const Message = ({ severity = 'info', title, children }) => (
  <Alert severity={severity} sx={{ mt: 2 }}>
    {title && <Typography fontWeight={600}>{title}</Typography>}
    {children}
  </Alert>
);

const CLOSED = {
  signed: {
    severity: 'success',
    title: 'Votre accord a déjà été enregistré.',
    text: 'Merci ! Vous pouvez fermer cette page.',
  },
  revoked: {
    severity: 'info',
    title: 'Cet accord a été retiré.',
    text: "Contactez l'association pour toute question : skola@sephoraberrebi.org.",
  },
  expired: {
    severity: 'warning',
    title: "Ce lien n'est plus valable.",
    text: 'Demandez un nouveau lien à l’association : skola@sephoraberrebi.org.',
  },
  cancelled: {
    severity: 'warning',
    title: 'Ce lien a été remplacé par un plus récent.',
    text: 'Utilisez le dernier lien reçu, ou contactez l’association : skola@sephoraberrebi.org.',
  },
  locked: {
    severity: 'error',
    title: 'Ce lien est bloqué.',
    text: 'Trop d’essais incorrects. Contactez l’association : skola@sephoraberrebi.org.',
  },
  invalid: {
    severity: 'error',
    title: 'Lien introuvable.',
    text: 'Vérifiez que le lien est complet, ou contactez l’association : skola@sephoraberrebi.org.',
  },
};

// Public page opened by a parent from the link received by e-mail or WhatsApp
const ConsentPage = () => {
  const { token } = useParams();
  const [page, setPage] = useState(null);
  const [form, setForm] = useState({
    birth_date: '',
    signer_name: '',
    signer_relation: '',
    choices: {},
  });
  const [signature, setSignature] = useState(null);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/consentement/${token}`)
      .then(({ data }) => {
        setPage(data);
        if (data.parent_name) {
          setForm((f) => ({ ...f, signer_name: data.parent_name }));
        }
      })
      .catch((err) => setPage(err.response?.data?.state ? err.response.data : { state: 'invalid' }));
  }, [token]);

  if (!page) return <LinearProgress />;

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const toggle = (id, value) =>
    setForm((f) => ({ ...f, choices: { ...f.choices, [id]: value } }));
  const items = page.items || [];
  const ready =
    items.every((i) => !i.required || form.choices[i.id]) &&
    form.signer_name.trim().length >= 3 &&
    form.signer_relation &&
    (!page.needs_birth_date || form.birth_date) &&
    signature;

  const submit = async () => {
    setSending(true);
    setError(null);
    try {
      const { data } = await axios.post(`${BASE_URL}/consentement/${token}`, {
        ...form,
        signature,
        // Lets the server check the amount read is still the current one
        participation_text:
          items.find((i) => i.id === 'participation')?.text || null,
      });
      setDone(data);
      window.scrollTo(0, 0);
    } catch (err) {
      const data = err.response?.data || {};
      if (data.state && data.state !== 'pending' && CLOSED[data.state]) {
        setPage({ state: data.state });
      } else if (data.code === 'fee_changed') {
        // New amount: shown again, to be ticked again
        setError(data.error);
        const { data: fresh } = await axios.get(`${BASE_URL}/consentement/${token}`);
        setPage(fresh);
        setForm((f) => {
          const { participation, ...choices } = f.choices;
          return { ...f, choices };
        });
      } else {
        setError(data.error || 'Une erreur est survenue. Merci de réessayer.');
      }
    } finally {
      setSending(false);
    }
  };

  const closed = done ? null : page.state !== 'pending' ? CLOSED[page.state] : null;

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Box component="img" src={logo} alt="" sx={{ width: 80, height: 80 }} />
        <Typography variant="h5" sx={{ mt: 1, color: '#9b2d61', fontWeight: 700 }}>
          Accord des parents
        </Typography>
        <Typography color="text.secondary">
          Accompagnement scolaire · Association Séphora Berrebi
        </Typography>
      </Box>

      {done && (
        <Message severity="success" title="Merci, votre accord est enregistré.">
          {done.copy_sent
            ? 'Vous allez recevoir votre exemplaire par e-mail.'
            : "L'association conserve votre exemplaire ; vous pouvez le lui demander à tout moment."}{' '}
          Vous pouvez fermer cette page.
        </Message>
      )}

      {closed && (
        <Message severity={closed.severity} title={closed.title}>
          {closed.text}
        </Message>
      )}

      {!done && !closed && (
        <>
          <Typography sx={{ mt: 2 }}>
            Bonjour{page.parent_name ? ` ${page.parent_name}` : ''},
          </Typography>
          <Typography sx={{ mt: 1 }}>
            L'association Séphora Berrebi va proposer à <b>{page.child}</b> un
            accompagnement scolaire, assuré par un tuteur bénévole.
            Pour commencer, nous avons besoin de votre accord. Lisez, cochez,
            puis signez en bas de la page.
          </Typography>
          <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 1 }}>
            Lien valable jusqu'au {frDate(page.expires_at)}.
          </Typography>

          {page.needs_birth_date && (
            <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
              <Typography fontWeight={600} sx={{ mb: 1 }}>
                Pour vérifier qu'il s'agit bien de vous
              </Typography>
              <TextField
                type="date"
                label={`Date de naissance de ${page.child}`}
                InputLabelProps={{ shrink: true }}
                value={form.birth_date}
                onChange={(e) => set('birth_date', e.target.value)}
                fullWidth
              />
            </Paper>
          )}

          <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
            <Typography fontWeight={600} sx={{ mb: 1 }}>
              Vos accords
            </Typography>
            <Stack spacing={1.5}>
              {items.map((item) => (
                <FormControlLabel
                  key={item.id}
                  sx={{ alignItems: 'flex-start', ml: 0 }}
                  control={
                    <Checkbox
                      sx={{ mt: -0.75 }}
                      checked={!!form.choices[item.id]}
                      onChange={(e) => toggle(item.id, e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography fontWeight={600} variant="body2">
                        {item.title}
                        {item.required && (
                          <Typography component="span" color="error">
                            {' '}*
                          </Typography>
                        )}
                      </Typography>
                      <Typography variant="body2">{item.text}</Typography>
                    </Box>
                  }
                />
              ))}
            </Stack>
            <Typography variant="caption" color="text.secondary">
              * obligatoire pour commencer le tutorat
            </Typography>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
            <Typography fontWeight={600} sx={{ mb: 1.5 }}>
              Votre signature
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Vos prénom et nom"
                value={form.signer_name}
                onChange={(e) => set('signer_name', e.target.value)}
                fullWidth
              />
              <TextField
                select
                label={`Votre lien avec ${page.child}`}
                value={form.signer_relation}
                onChange={(e) => set('signer_relation', e.target.value)}
                fullWidth>
                {(page.relations || []).map((r) => (
                  <MenuItem key={r} value={r}>
                    {r}
                  </MenuItem>
                ))}
              </TextField>
              <SignaturePad onChange={setSignature} />
            </Stack>
          </Paper>

          {error && <Message severity="error">{error}</Message>}

          <Button
            variant="contained"
            size="large"
            fullWidth
            sx={{ mt: 2 }}
            disabled={!ready || sending}
            onClick={submit}
            startIcon={sending ? <CircularProgress size={18} color="inherit" /> : null}>
            Je donne mon accord
          </Button>
          <Typography
            variant="caption"
            color="text.secondary"
            component="div"
            sx={{ mt: 1, textAlign: 'center' }}>
            En cliquant, vous signez électroniquement ce document. Vous pourrez
            retirer votre accord à tout moment en écrivant à
            skola@sephoraberrebi.org.
          </Typography>
        </>
      )}
    </Container>
  );
};

export default ConsentPage;
