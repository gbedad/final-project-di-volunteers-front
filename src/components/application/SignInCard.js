import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Box,
  Button,
  Link,
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
import { tutorialPath, useTutorials } from '../../js/tutorials';
import { DeclareTodayDialog } from './DeclareToday';


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
        extra_id: session.extra_id ?? null,
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

// "Need help?" under the card, when the video tutorial of the sign-in has
// been sent by the team (opens in a new tab: the sign-in stays as it is)
const HelpLink = () => {
  const tutorial = (useTutorials() || []).find(
    (t) => t.slug === 'emargement' && t.has_video
  );
  if (!tutorial) return null;
  return (
    <Box component="span" sx={{ display: 'block', mt: 0.75 }}>
      Besoin d'aide ?{' '}
      <Link
        href={tutorialPath(tutorial.slug)}
        target="_blank"
        rel="noopener"
        fontWeight={600}>
        Voir le tutoriel vidéo
      </Link>
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

// The sessions of today, one line each: the regular slot (unless it was moved)
// and the exceptional ones (in addition, or moved, remote ones are on Zoom).
// key: the exceptional session's id, null for the slot
const linesToday = (pair) => {
  const day = DAYS_FR[new Date().getDay()];
  const extras = (pair.extras || []).filter((e) => e.date === today());
  const moved = extras.find((e) => e.kind === 'remplacement');
  const daySlot = needsSignIn(pair)
    ? (pair.schedule || []).find((s) => s.day === day) || null
    : null;
  const lines = [];
  if (daySlot && !moved) {
    lines.push({ key: null, startTime: daySlot.startTime, endTime: daySlot.endTime, extra: null, daySlot });
  }
  for (const e of extras) {
    if (e.remote) continue;
    lines.push({ key: e.id, startTime: e.start_time, endTime: e.end_time, extra: e, daySlot });
  }
  return lines;
};

// The report or sign-in of a line: its exceptional session, or, when the day
// has no slot (or the slot was moved), every row of the day (rows written
// before the extra_id column)
const rowsOf = (pair, line) => {
  const solo = !!line.extra && (line.extra.kind === 'remplacement' || !line.daySlot);
  return (pair.sessions || []).filter(
    (s) =>
      String(s.date).slice(0, 10) === today() &&
      (solo || (s.extra_id ?? null) === line.key)
  );
};

const SignInCard = ({ pairs, onChanged }) => {
  const [busy, setBusy] = useState(null);
  const [adding, setAdding] = useState(null);
  const [moving, setMoving] = useState(null);
  // Only the pairs with a session today, on site: a day without a session
  // shows no « Fin de séance »
  const active = pairs.filter((p) => p.status === 'actif' && linesToday(p).length);
  if (!active.length) return null;
  // Students with a session today first
  const sorted = [...active];

  const signIn = async (pair, line, attendance, late = false) => {
    setBusy(`${pair.id}:${line.key}`);
    try {
      await axios.post(`${BASE_URL}/my/binomes/${pair.id}/emargement`, {
        attendance,
        late,
        extra_id: line.key,
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
        { position: 'top-center' }
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
        {sorted.map((pair) =>
          linesToday(pair).map((line) => {
            const name = `${pair.student.first_name} ${pair.student.initial}`;
            const done = rowsOf(pair, line)[0] || null;
            const busyHere = busy === `${pair.id}:${line.key}`;
            const early = !done && nowMinutes() < minutesOf(line.endTime) - 10;
            const label = !line.extra
              ? `créneau ${line.startTime}–${line.endTime}`
              : line.extra.kind === 'remplacement'
                ? `séance déplacée ${line.startTime}–${line.endTime}`
                : line.daySlot
                  ? `séance en plus ${line.startTime}–${line.endTime}`
                  : `séance ${line.startTime}–${line.endTime}`;
            return (
              <Box key={`${pair.id}:${line.key}`}>
                <Typography fontWeight={600}>
                  {name}
                  <Typography component="span" variant="body2" color="text.secondary">
                    {` · aujourd'hui, ${label}`}
                  </Typography>
                </Typography>
                {done ? (
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
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
                  <StudentSignature session={done} firstName={pair.student.first_name} onChanged={onChanged} />
                )}
                {done &&
                  done.attendance === 'présent' &&
                  (done.student_signed_at || done.no_signature) &&
                  (done.work || done.progress || done.remark ? (
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                      <CheckCircleIcon color="success" fontSize="small" />
                      <Typography variant="body2">Compte-rendu enregistré</Typography>
                    </Stack>
                  ) : (
                    <QuickReport pair={pair} session={done} onChanged={onChanged} />
                  ))}
                {done ? null : (
                  <Box sx={{ mt: 0.75 }}>
                    <Typography variant="body2" sx={{ mb: 0.75 }}>
                      {early
                        ? `À faire à la fin de la séance (fin prévue à ${line.endTime}). ${pair.student.first_name} était :`
                        : `La séance est terminée : ${pair.student.first_name} était :`}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="flex-start">
                      <Button variant="contained" size="large" disabled={busyHere} onClick={() => signIn(pair, line, 'présent')}>
                        Présent, à l'heure
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        disabled={busyHere}
                        onClick={() => signIn(pair, line, 'présent', true)}
                        sx={{ flexDirection: 'column', lineHeight: 1.2 }}>
                        Présent, en retard
                        <Typography component="span" variant="caption" sx={{ textTransform: 'none' }}>
                          15 min ou plus
                        </Typography>
                      </Button>
                      <Button size="large" disabled={busyHere} onClick={() => signIn(pair, line, 'absent')}>
                        Absent
                      </Button>
                    </Stack>
                    {line.daySlot && !line.extra && (
                      <Button size="small" variant="text" sx={{ mt: 1 }} onClick={() => setMoving(pair)}>
                        Le créneau a été déplacé
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
            );
          })
        )}
      </Stack>
      {/* Once per pair with a slot today: a second session in addition */}
      {sorted
        .filter((p) => linesToday(p).some((l) => l.daySlot) && !(p.extras || []).some((e) => e.date === today()))
        .map((pair) => (
          <Box key={`plus-${pair.id}`} sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">
              {pair.student.first_name} : une deuxième séance aujourd'hui ?
            </Typography>
            <Button size="small" variant="outlined" sx={{ mt: 0.5 }} onClick={() => setAdding(pair)}>
              Ajouter une séance en plus
            </Button>
          </Box>
        ))}
      <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 1.5 }}>
        À la fin de chaque séance : la présence de l'élève, sa signature, puis
        votre compte-rendu. La date et l'heure sont enregistrées
        automatiquement. Séances à distance : le rapport Zoom fait foi, pas
        besoin d'émarger.
        <HelpLink />
      </Typography>
      <DeclareTodayDialog
        open={!!moving}
        pair={moving}
        mode="moved"
        onClose={() => setMoving(null)}
        onDone={() => {
          setMoving(null);
          onChanged();
        }}
      />
      <DeclareTodayDialog
        open={!!adding}
        pair={adding}
        mode="plus"
        onClose={() => setAdding(null)}
        onDone={() => {
          setAdding(null);
          onChanged();
        }}
      />
    </Paper>
  );
};

export default SignInCard;
