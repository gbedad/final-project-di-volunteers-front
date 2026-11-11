import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Rating,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BackspaceIcon from '@mui/icons-material/BackspaceOutlined';
import SignaturePad from '../application/SignaturePad';
import { PROGRESS_LABELS } from '../students/Sessions';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const KEY = 'kiosk-token';
// Back to the list after this long without a touch
const IDLE_MS = 2 * 60 * 1000;

const readKey = () => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};
// Plain fetch: the tablet has no account (no session to renew)
const call = async (path, { method = 'GET', body, pass } = {}) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-kiosk-token': readKey() || '',
      ...(pass ? { 'x-kiosk-pass': pass } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Action impossible');
    err.status = res.status;
    err.code = data.code;
    throw err;
  }
  return data;
};
const frToday = () =>
  new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Paris',
  });

// The tutor's code: last 4 digits of their phone, on a big keypad
const Keypad = ({ onDone, error, busy }) => {
  const [digits, setDigits] = useState('');
  useEffect(() => {
    if (error) setDigits('');
  }, [error]);
  const press = (d) => {
    if (busy) return;
    const next = (digits + d).slice(0, 4);
    setDigits(next);
    if (next.length === 4) onDone(next);
  };
  return (
    <Stack spacing={2} alignItems="center">
      <Typography variant="h4" sx={{ letterSpacing: '0.5em', minHeight: 48 }}>
        {'●'.repeat(digits.length) + '○'.repeat(4 - digits.length)}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 84px)',
          gap: 1.5,
        }}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <Button
            key={d}
            variant="outlined"
            sx={{ height: 72, fontSize: 28 }}
            onClick={() => press(d)}>
            {d}
          </Button>
        ))}
        <span />
        <Button
          variant="outlined"
          sx={{ height: 72, fontSize: 28 }}
          onClick={() => press('0')}>
          0
        </Button>
        <Button
          aria-label="Effacer"
          sx={{ height: 72 }}
          onClick={() => setDigits(digits.slice(0, -1))}>
          <BackspaceIcon />
        </Button>
      </Box>
    </Stack>
  );
};

const KioskPage = () => {
  const [state, setState] = useState({ step: 'loading' });
  const [day, setDay] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [signature, setSignature] = useState(null);
  const [report, setReport] = useState({ progress: 3, work: '', remark: '' });
  const idle = useRef(null);

  // Activation: /borne?code=… keeps the key in the tablet, then hides it
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
      try {
        localStorage.setItem(KEY, code);
      } catch {}
      window.history.replaceState(null, '', '/borne');
    }
  }, []);

  const load = useCallback(async () => {
    if (!readKey()) {
      setState({ step: 'inactive' });
      return;
    }
    try {
      const data = await call('/kiosk/today');
      setDay(data);
      setState((s) =>
        s.step === 'loading' || s.step === 'list' ? { step: 'list' } : s
      );
    } catch (err) {
      if (err.code === 'kiosk')
        setState({ step: 'inactive', message: err.message });
      else setError('Pas de connexion au serveur. Vérifiez le Wi-Fi.');
    }
  }, []);
  useEffect(() => {
    load();
    const t = setInterval(load, 60 * 1000);
    return () => clearInterval(t);
  }, [load]);

  const toList = useCallback(() => {
    setState({ step: 'list' });
    setError('');
    setSignature(null);
    setReport({ progress: 3, work: '', remark: '' });
    load();
  }, [load]);
  // Any touch restarts the idle timer; idle: back to the list
  useEffect(() => {
    const reset = () => {
      clearTimeout(idle.current);
      idle.current = setTimeout(() => {
        if (state.step !== 'list') toList();
      }, IDLE_MS);
    };
    reset();
    window.addEventListener('pointerdown', reset);
    return () => {
      clearTimeout(idle.current);
      window.removeEventListener('pointerdown', reset);
    };
  }, [state.step, toList]);

  const act = async (fn) => {
    setBusy(true);
    setError('');
    try {
      await fn();
    } catch (err) {
      setError(err.message);
      if (err.status === 401 && err.code !== 'kiosk')
        setState((s) => ({ ...s, step: 'code' }));
    } finally {
      setBusy(false);
    }
  };
  const pick = (pair) => {
    const s = pair.session;
    if (
      s &&
      (s.attendance !== 'présent' ||
        ((s.signed || s.no_signature) && s.reported))
    ) {
      setState({ step: 'already', pair });
      return;
    }
    setState({ step: 'code', pair });
  };
  const verify = (digits) =>
    act(async () => {
      const { pass, tutor_first_name } = await call(
        `/kiosk/pairs/${state.pair.id}/verify`,
        {
          method: 'POST',
          body: { digits },
        }
      );
      const s = state.pair.session;
      const next = !s
        ? 'signin'
        : !s.signed && !s.no_signature
          ? 'signature'
          : 'report';
      setState({
        ...state,
        step: next,
        pass,
        tutor: tutor_first_name,
        sessionId: s?.id,
      });
    });
  const signIn = (attendance, late = false) =>
    act(async () => {
      const { id } = await call(`/kiosk/pairs/${state.pair.id}/sign-in`, {
        method: 'POST',
        pass: state.pass,
        body: { attendance, late },
      });
      setState({
        ...state,
        step: attendance === 'absent' ? 'done' : 'signature',
        sessionId: id,
      });
    });
  const sign = (none) =>
    act(async () => {
      await call(
        `/kiosk/seances/${state.sessionId}/${none ? 'no-signature' : 'signature'}`,
        {
          method: 'POST',
          pass: state.pass,
          body: none ? {} : { signature },
        }
      );
      setState({ ...state, step: 'report' });
    });
  const saveReport = () =>
    act(async () => {
      await call(`/kiosk/seances/${state.sessionId}/report`, {
        method: 'POST',
        pass: state.pass,
        body: report,
      });
      setState({ ...state, step: 'done' });
    });
  // "Merci", then back to the list
  useEffect(() => {
    if (state.step !== 'done' && state.step !== 'already') return undefined;
    const t = setTimeout(toList, 5000);
    return () => clearTimeout(t);
  }, [state.step, toList]);

  const pair = state.pair;
  const header = (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="baseline"
      flexWrap="wrap"
      useFlexGap
      gap={1}
      sx={{ mb: 3 }}>
      <Typography variant="h5" color="primary" fontWeight={600}>
        Émargement{day?.kiosk?.site ? ` · ${day.kiosk.site}` : ''}
      </Typography>
      <Typography color="text.secondary" sx={{ textTransform: 'capitalize' }}>
        {frToday()}
      </Typography>
    </Stack>
  );

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      {header}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {state.step === 'inactive' && (
        <Alert severity="info">
          {state.message ||
            'Cette tablette n’est pas encore activée comme borne.'}{' '}
          Demandez à l'équipe un lien d'activation et ouvrez-le sur cette
          tablette.
        </Alert>
      )}

      {state.step === 'list' && day && (
        <Stack spacing={1.5}>
          <Typography color="text.secondary">Touchez votre binôme.</Typography>
          {day.pairs.length === 0 && (
            <Alert severity="info">Aucun binôme sur site aujourd'hui.</Alert>
          )}
          {day.pairs.map((p) => (
            <Paper
              key={p.id}
              component="button"
              onClick={() => pick(p)}
              variant="outlined"
              sx={{
                p: 2,
                textAlign: 'left',
                cursor: 'pointer',
                font: 'inherit',
                color: 'inherit',
                bgcolor: 'background.paper',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                opacity: p.slot ? 1 : 0.75,
              }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h6">
                  {p.student} · avec {p.tutor}
                </Typography>
                <Typography color="text.secondary">
                  {p.slot
                    ? `${p.slot.startTime}–${p.slot.endTime}`
                    : "Pas de créneau aujourd'hui"}
                  {p.subjects.length ? ` · ${p.subjects.join(', ')}` : ''}
                </Typography>
              </Box>
              {p.session && <CheckCircleIcon color="success" />}
            </Paper>
          ))}
        </Stack>
      )}

      {state.step === 'code' && pair && (
        <Stack spacing={3} alignItems="center">
          <Typography variant="h6" textAlign="center">
            {pair.tutor} : tapez les 4 derniers chiffres de votre téléphone
          </Typography>
          <Keypad onDone={verify} error={error} busy={busy} />
          <Button onClick={toList}>Retour</Button>
        </Stack>
      )}

      {state.step === 'signin' && pair && (
        <Stack spacing={2}>
          <Typography variant="h6">
            Bonjour {state.tutor}, séance avec {pair.student_first}
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{ py: 2 }}
            disabled={busy}
            onClick={() => signIn('présent')}>
            La séance a eu lieu, à l'heure
          </Button>
          <Button
            variant="outlined"
            size="large"
            sx={{ py: 2 }}
            disabled={busy}
            onClick={() => signIn('présent', true)}>
            L'élève est arrivé très en retard
          </Button>
          <Button size="large" disabled={busy} onClick={() => signIn('absent')}>
            L'élève n'est pas venu
          </Button>
          <Button onClick={toList}>Retour</Button>
        </Stack>
      )}

      {state.step === 'signature' && pair && (
        <Stack spacing={2}>
          <Typography variant="h6">
            Signature de {pair.student_first}
          </Typography>
          <SignaturePad onChange={setSignature} />
          <Button
            variant="contained"
            size="large"
            disabled={!signature || busy}
            onClick={() => sign(false)}>
            Valider la signature
          </Button>
          <Button color="inherit" disabled={busy} onClick={() => sign(true)}>
            L'élève ne peut pas / n'a pas pu signer
          </Button>
        </Stack>
      )}

      {state.step === 'report' && pair && (
        <Stack spacing={2}>
          <Typography variant="h6">Compte-rendu</Typography>
          <Stack spacing={0.5}>
            <Typography>Comment s'est passée la séance ?</Typography>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Rating
                size="large"
                value={report.progress}
                onChange={(e, v) => setReport({ ...report, progress: v || 1 })}
              />
              <Typography color="text.secondary">
                {PROGRESS_LABELS[report.progress]}
              </Typography>
            </Stack>
          </Stack>
          <TextField
            label="Ce que vous avez travaillé"
            value={report.work}
            onChange={(e) => setReport({ ...report, work: e.target.value })}
            multiline
            minRows={2}
          />
          <TextField
            label="Remarque pour l'association"
            value={report.remark}
            onChange={(e) => setReport({ ...report, remark: e.target.value })}
            multiline
          />
          <Button
            variant="contained"
            size="large"
            disabled={busy}
            onClick={saveReport}>
            Enregistrer
          </Button>
          <Button
            color="inherit"
            onClick={() => setState({ ...state, step: 'done' })}>
            Plus tard (depuis mon téléphone)
          </Button>
        </Stack>
      )}

      {(state.step === 'done' || state.step === 'already') && (
        <Stack spacing={2} alignItems="center" sx={{ py: 6 }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 72 }} />
          <Typography variant="h5" textAlign="center">
            {state.step === 'done'
              ? 'Merci, c’est enregistré.'
              : 'Cette séance est déjà enregistrée.'}
          </Typography>
          <Button onClick={toList}>Retour à la liste</Button>
        </Stack>
      )}
    </Container>
  );
};

export default KioskPage;
