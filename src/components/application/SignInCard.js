import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import DrawIcon from '@mui/icons-material/Draw';
import SignaturePad from './SignaturePad';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const DAYS_FR = [
  'Dimanche',
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
];
const today = () =>
  new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' });
const timeOf = (d) =>
  new Date(d).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  });
// Remote sessions: the Zoom report is the proof (Charte)
export const needsSignIn = (pair) =>
  !/^\s*(à|a) distance\s*$/i.test(pair.how_location || '');

// The student signs at the end of the session, on the tutor's phone (same
// day); never blocking: "L'élève ne peut pas / n'a pas pu signer"
const StudentSignature = ({ session, firstName, onChanged }) => {
  const [signature, setSignature] = useState(null);
  const [busy, setBusy] = useState(false);
  if (session.student_signed_at) {
    return (
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
        <DrawIcon color="success" fontSize="small" />
        <Typography variant="body2">
          Signée par {firstName} à {timeOf(session.student_signed_at)}
        </Typography>
      </Stack>
    );
  }
  if (session.no_signature) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        Séance non signée par l'élève.
      </Typography>
    );
  }
  const send = async (path, body) => {
    setBusy(true);
    try {
      await axios.post(`${BASE_URL}/my/seances/${session.id}/${path}`, body);
      if (path === 'signature') {
        toast.success(`Merci ${firstName} !`, { position: 'top-center' });
      }
      onChanged();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Enregistrement impossible', {
        position: 'top-center',
      });
    } finally {
      setBusy(false);
    }
  };
  return (
    <Box sx={{ mt: 1.5 }}>
      <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
        Signature de {firstName} (en fin de séance)
      </Typography>
      <SignaturePad onChange={setSignature} />
      <Stack
        direction="row"
        spacing={1}
        flexWrap="wrap"
        useFlexGap
        sx={{ mt: 1 }}>
        <Button
          variant="contained"
          disabled={!signature || busy}
          onClick={() => send('signature', { signature })}>
          Valider la signature
        </Button>
        <Button
          color="inherit"
          disabled={busy}
          onClick={() => send('no-signature')}>
          L'élève ne peut pas / n'a pas pu signer
        </Button>
      </Stack>
    </Box>
  );
};

// "Émarger ma séance": one tap per student, date and time set by the server
const SignInCard = ({ pairs, onChanged, onReport }) => {
  const [busy, setBusy] = useState(null);
  const active = pairs.filter((p) => p.status === 'actif' && needsSignIn(p));
  if (!active.length) return null;
  const day = DAYS_FR[new Date().getDay()];
  // Students with a slot today first
  const sorted = [...active].sort(
    (a, b) =>
      Number((b.schedule || []).some((s) => s.day === day)) -
      Number((a.schedule || []).some((s) => s.day === day))
  );

  // late: the student arrived 15 minutes late or more
  const signIn = async (pair, attendance, late = false) => {
    setBusy(pair.id);
    try {
      await axios.post(`${BASE_URL}/my/binomes/${pair.id}/emargement`, {
        attendance,
        late,
      });
      toast.success(
        attendance === 'absent'
          ? `Absence de ${pair.student.first_name} enregistrée.`
          : late
            ? 'Séance émargée avec le retard. Pensez à le déclarer sur le groupe WhatsApp de la famille.'
            : `Séance avec ${pair.student.first_name} émargée. Merci !`,
        { position: 'top-center', duration: late ? 8000 : 4000 }
      );
      onChanged();
    } catch (err) {
      toast.error(
        err.response?.data?.error || "L'émargement n'a pas pu être enregistré",
        {
          position: 'top-center',
        }
      );
      if (err.response?.status === 409) onChanged();
    } finally {
      setBusy(null);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, borderColor: 'primary.main' }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
        <HowToRegIcon color="primary" />
        <Typography variant="h6">Émarger ma séance</Typography>
      </Stack>
      <Stack spacing={1.5}>
        {sorted.map((pair) => {
          const done = (pair.sessions || []).find(
            (s) => String(s.date).slice(0, 10) === today()
          );
          const slot = (pair.schedule || []).find((s) => s.day === day);
          return (
            <Box key={pair.id}>
              <Typography fontWeight={600}>
                {pair.student.first_name} {pair.student.initial}
                <Typography
                  component="span"
                  variant="body2"
                  color="text.secondary">
                  {slot
                    ? ` · aujourd'hui ${slot.startTime}–${slot.endTime}`
                    : ''}
                </Typography>
              </Typography>
              {done ? (
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ mt: 0.5 }}>
                  {done.attendance === 'absent' ? (
                    <EventBusyIcon color="warning" fontSize="small" />
                  ) : (
                    <CheckCircleIcon color="success" fontSize="small" />
                  )}
                  <Typography variant="body2">
                    {done.attendance === 'absent'
                      ? 'Absence enregistrée'
                      : 'Séance émargée'}{' '}
                    à {timeOf(done.created_at)}
                    {done.late ? ' · élève très en retard' : ''}
                  </Typography>
                  {done.attendance === 'présent' && !done.work && (
                    <Button size="small" onClick={() => onReport(pair)}>
                      Ajouter un compte-rendu (facultatif)
                    </Button>
                  )}
                </Stack>
              ) : null}
              {done && done.attendance === 'présent' && (
                <StudentSignature
                  session={done}
                  firstName={pair.student.first_name}
                  onChanged={onChanged}
                />
              )}
              {done ? null : (
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ mt: 0.75 }}>
                  <Button
                    variant="contained"
                    size="large"
                    disabled={busy === pair.id}
                    onClick={() => signIn(pair, 'présent')}>
                    La séance a eu lieu, à l'heure
                  </Button>
                  <Button
                    variant="outlined"
                    disabled={busy === pair.id}
                    onClick={() => signIn(pair, 'présent', true)}>
                    L'élève est arrivé très en retard
                  </Button>
                  <Button
                    disabled={busy === pair.id}
                    onClick={() => signIn(pair, 'absent')}>
                    L'élève n'est pas venu
                  </Button>
                </Stack>
              )}
            </Box>
          );
        })}
      </Stack>
      <Typography
        variant="caption"
        color="text.secondary"
        component="div"
        sx={{ mt: 1.5 }}>
        La date et l'heure sont enregistrées automatiquement. Séances à distance
        : le rapport Zoom fait foi, pas besoin d'émarger.
      </Typography>
    </Paper>
  );
};

export default SignInCard;
