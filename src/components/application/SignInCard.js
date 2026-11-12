import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Box,
  Button,
  Paper,
  Rating,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import DrawIcon from '@mui/icons-material/Draw';
import SignaturePad from './SignaturePad';
import { PROGRESS_LABELS } from '../students/Sessions';

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
        Signature de {firstName}
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

// Right after the attendance and the student's signature: the report, on
// the same screen, in a few seconds; "Plus tard" leaves it for later
const QuickReport = ({ pair, session, onChanged }) => {
  const [progress, setProgress] = useState(3);
  const [work, setWork] = useState('');
  const [remark, setRemark] = useState('');
  const [later, setLater] = useState(false);
  const [busy, setBusy] = useState(false);
  if (later) {
    return (
      <Button size="small" sx={{ mt: 1 }} onClick={() => setLater(false)}>
        Écrire le compte-rendu
      </Button>
    );
  }
  const save = async () => {
    setBusy(true);
    try {
      // Completes the session signed in today (same day, same tutor)
      await axios.post(`${BASE_URL}/my/binomes/${pair.id}/seances`, {
        date: today(),
        attendance: 'présent',
        duration_minutes: session.duration_minutes,
        late: !!session.late,
        progress,
        work,
        remark,
      });
      toast.success('Compte-rendu enregistré. Merci !', {
        position: 'top-center',
      });
      onChanged();
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          "Le compte-rendu n'a pas pu être enregistré",
        { position: 'top-center' }
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <Box
      sx={{
        mt: 1.5,
        p: 1.5,
        borderRadius: 1,
        bgcolor: 'action.hover',
      }}>
      <Stack spacing={1.25}>
        <Typography variant="body2" fontWeight={600}>
          Compte-rendu
        </Typography>
        <Stack spacing={0.5}>
          <Typography variant="body2">
            Comment s'est passée la séance ?
          </Typography>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Rating
              size="large"
              value={progress}
              onChange={(e, v) => setProgress(v || 1)}
            />
            <Typography variant="body2" color="text.secondary">
              {PROGRESS_LABELS[progress]}
            </Typography>
          </Stack>
        </Stack>
        <TextField
          size="small"
          label="Ce que vous avez travaillé"
          value={work}
          onChange={(e) => setWork(e.target.value)}
          multiline
          minRows={2}
          fullWidth
        />
        <TextField
          size="small"
          label="Remarque pour l'association"
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          multiline
          fullWidth
        />
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button variant="contained" disabled={busy} onClick={save}>
            Enregistrer
          </Button>
          <Button
            color="inherit"
            disabled={busy}
            onClick={() => setLater(true)}>
            Plus tard
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

// Minutes since midnight, Paris time
const nowMinutes = () => {
  const [h, m] = new Date()
    .toLocaleTimeString('fr-FR', {
      timeZone: 'Europe/Paris',
      hour: '2-digit',
      minute: '2-digit',
    })
    .split(':')
    .map(Number);
  return h * 60 + m;
};
const minutesOf = (hhmm) => {
  const m = /^(\d{1,2}):(\d{2})/.exec(hhmm || '');
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};

// End of the session, in one go: was the student there (on time, late or
// absent), the student's signature, then the report. Date and time are set
// by the server; lateness is what the tutor says (Charte: 15 min or more).
const SignInCard = ({ pairs, onChanged }) => {
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
            ? 'Retard enregistré. Pensez à le signaler sur le groupe WhatsApp de la famille.'
            : `Présence de ${pair.student.first_name} enregistrée.`,
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
        <Typography variant="h6">Fin de séance : émarger</Typography>
      </Stack>
      <Stack spacing={1.5}>
        {sorted.map((pair) => {
          const done = (pair.sessions || []).find(
            (s) => String(s.date).slice(0, 10) === today()
          );
          const slot = (pair.schedule || []).find((s) => s.day === day);
          // Before the planned end: a reminder, never blocking
          const early =
            !done && slot && nowMinutes() < minutesOf(slot.endTime) - 10;
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
                      ? 'Absent'
                      : done.late
                        ? 'Présent, en retard'
                        : "Présent, à l'heure"}{' '}
                    · émargé à {timeOf(done.created_at)}
                  </Typography>
                </Stack>
              ) : null}
              {done && done.attendance === 'présent' && (
                <StudentSignature
                  session={done}
                  firstName={pair.student.first_name}
                  onChanged={onChanged}
                />
              )}
              {/* Then the report, once the student signed (or could not) */}
              {done &&
                done.attendance === 'présent' &&
                (done.student_signed_at || done.no_signature) &&
                (done.work || done.progress || done.remark ? (
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mt: 0.5 }}>
                    <CheckCircleIcon color="success" fontSize="small" />
                    <Typography variant="body2">
                      Compte-rendu enregistré
                    </Typography>
                  </Stack>
                ) : (
                  <QuickReport
                    pair={pair}
                    session={done}
                    onChanged={onChanged}
                  />
                ))}
              {done ? null : (
                <Box sx={{ mt: 0.75 }}>
                  <Typography variant="body2" sx={{ mb: 0.75 }}>
                    {early
                      ? `À faire à la fin de la séance (fin prévue à ${slot.endTime}). ${pair.student.first_name} était :`
                      : `La séance est terminée : ${pair.student.first_name} était :`}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    useFlexGap
                    alignItems="flex-start">
                    <Button
                      variant="contained"
                      size="large"
                      disabled={busy === pair.id}
                      onClick={() => signIn(pair, 'présent')}>
                      Présent, à l'heure
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      disabled={busy === pair.id}
                      onClick={() => signIn(pair, 'présent', true)}
                      sx={{ flexDirection: 'column', lineHeight: 1.2 }}>
                      Présent, en retard
                      <Typography
                        component="span"
                        variant="caption"
                        sx={{ textTransform: 'none' }}>
                        15 min ou plus
                      </Typography>
                    </Button>
                    <Button
                      size="large"
                      disabled={busy === pair.id}
                      onClick={() => signIn(pair, 'absent')}>
                      Absent
                    </Button>
                  </Stack>
                </Box>
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
        À la fin de chaque séance : la présence de l'élève, sa signature, puis
        votre compte-rendu. La date et l'heure sont enregistrées
        automatiquement. Séances à distance : le rapport Zoom fait foi, pas
        besoin d'émarger.
      </Typography>
    </Paper>
  );
};

export default SignInCard;
