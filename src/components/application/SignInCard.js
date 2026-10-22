import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HowToRegIcon from '@mui/icons-material/HowToReg';

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

  const signIn = async (pair, attendance) => {
    setBusy(pair.id);
    try {
      await axios.post(`${BASE_URL}/my/binomes/${pair.id}/emargement`, {
        attendance,
      });
      toast.success(
        attendance === 'présent'
          ? `Séance avec ${pair.student.first_name} émargée. Merci !`
          : `Absence de ${pair.student.first_name} enregistrée.`,
        { position: 'top-center' }
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
                  <CheckCircleIcon color="success" fontSize="small" />
                  <Typography variant="body2">
                    {done.attendance === 'absent'
                      ? 'Absence enregistrée'
                      : 'Séance émargée'}{' '}
                    à {timeOf(done.created_at)}
                  </Typography>
                  {done.attendance === 'présent' && !done.work && (
                    <Button size="small" onClick={() => onReport(pair)}>
                      Ajouter un compte-rendu (facultatif)
                    </Button>
                  )}
                </Stack>
              ) : (
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
                    La séance a eu lieu
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
