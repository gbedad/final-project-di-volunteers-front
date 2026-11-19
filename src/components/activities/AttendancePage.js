import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Container,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  BASE_URL,
  frDate,
  hours,
  pointChoices,
  studentPoint,
} from './activityUtils';
import { showPhone } from '../../js/phone';

// The adult going with the students ticks who is there, on their phone,
// through their own link (no account). What was received is kept on the
// phone (addresses, phones, meeting points, ticks), also without network:
// the ticks are sent as soon as the network is back.
const parisToday = () =>
  new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' });
const addDays = (d, n) => {
  const x = new Date(`${d}T12:00:00Z`);
  x.setUTCDate(x.getUTCDate() + n);
  return x.toISOString().slice(0, 10);
};
// Kept until three days after the outing
const KEEP_DAYS = 3;
const store = {
  read: (key) => {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch {
      return null;
    }
  },
  write: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },
  drop: (key) => {
    try {
      localStorage.removeItem(key);
    } catch {}
  },
};
const readCache = (key) => {
  const c = store.read(key);
  if (!c?.page) return null;
  const d = c.page.activity?.date;
  if (d && parisToday() > addDays(d, KEEP_DAYS)) {
    store.drop(key);
    return null;
  }
  return c;
};
const clock = (at) =>
  new Date(at).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  });
// No answer from the server (no network, server waking up) or its failure
const unreachable = (err) => !err.response || err.response.status >= 500;

const AttendancePage = () => {
  const { token } = useParams();
  const cacheKey = `sortie:${token}`;
  const queueKey = `sortie-queue:${token}`;
  const [page, setPage] = useState(null);
  const [error, setError] = useState(null);
  // When the page shown is the one kept on the phone: 'offline' | 'replaced'
  const [notice, setNotice] = useState(null);
  const [syncedAt, setSyncedAt] = useState(null);
  const [busy, setBusy] = useState(null);
  // Ticks not sent yet: [{ registration_id, attendance }]
  const [queue, setQueue] = useState(() => store.read(queueKey) || []);
  const queueRef = useRef(queue);
  const flushing = useRef(false);
  const changeQueue = (next) => {
    queueRef.current = next;
    setQueue(next);
    if (next.length) store.write(queueKey, next);
    else store.drop(queueKey);
  };
  // What the phone keeps follows the page
  useEffect(() => {
    if (page) store.write(cacheKey, { page, at: syncedAt });
  }, [page, syncedAt, cacheKey]);

  // Ticks of the queue shown on a page just received
  const withQueue = (data) => ({
    ...data,
    students: data.students.map((x) => {
      const q = queueRef.current.find((i) => i.registration_id === x.id);
      return q ? { ...x, attendance: q.attendance } : x;
    }),
  });
  const flush = useCallback(async () => {
    if (flushing.current || !queueRef.current.length) return;
    flushing.current = true;
    for (const item of [...queueRef.current]) {
      try {
        await axios.post(`${BASE_URL}/sortie/${token}`, item);
        changeQueue(
          queueRef.current.filter(
            (i) => i.registration_id !== item.registration_id
          )
        );
      } catch (err) {
        if (unreachable(err)) break;
        // Refused (link closed or replaced): not sent, the person is told
        changeQueue(
          queueRef.current.filter(
            (i) => i.registration_id !== item.registration_id
          )
        );
        toast.error(
          err.response?.data?.error || "Une présence n'a pas pu être envoyée",
          { position: 'top-center' }
        );
      }
    }
    flushing.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const load = useCallback(() => {
    axios
      .get(`${BASE_URL}/sortie/${token}`)
      .then(({ data }) => {
        setPage(withQueue(data));
        setSyncedAt(Date.now());
        setNotice(null);
        setError(null);
        flush();
      })
      .catch((err) => {
        const kept = readCache(cacheKey);
        const status = err.response?.status;
        // The phone has the last page received: it stays in front of the eyes
        if (kept && (unreachable(err) || status === 404)) {
          setPage(withQueue(kept.page));
          setSyncedAt(kept.at);
          setNotice(status === 404 ? 'replaced' : 'offline');
          return;
        }
        setError(
          err.response?.data?.error ||
            'Pas de réseau, ou page indisponible. Réessayez dans un instant.'
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, cacheKey, flush]);
  useEffect(load, [load]);
  // The network is back, or time passes with ticks to send
  useEffect(() => {
    const back = () => {
      flush();
      load();
    };
    window.addEventListener('online', back);
    const timer = setInterval(() => flush(), 15000);
    return () => {
      window.removeEventListener('online', back);
      clearInterval(timer);
    };
  }, [flush, load]);

  const show = (id, value) =>
    setPage((p) => ({
      ...p,
      students: p.students.map((x) =>
        x.id === id ? { ...x, attendance: value } : x
      ),
    }));
  const tick = async (s, attendance) => {
    setBusy(s.id);
    const value = s.attendance === attendance ? null : attendance;
    show(s.id, value);
    try {
      await axios.post(`${BASE_URL}/sortie/${token}`, {
        registration_id: s.id,
        attendance: value,
      });
      changeQueue(
        queueRef.current.filter((i) => i.registration_id !== s.id)
      );
    } catch (err) {
      if (unreachable(err)) {
        // No network: kept on the phone, sent later
        changeQueue([
          ...queueRef.current.filter((i) => i.registration_id !== s.id),
          { registration_id: s.id, attendance: value },
        ]);
        toast('Pas de réseau : coché sur ce téléphone, envoi dès que possible', {
          position: 'top-center',
          icon: '📶',
        });
      } else {
        show(s.id, s.attendance);
        toast.error(
          err.response?.data?.error ||
            "La présence n'a pas pu être enregistrée",
          { position: 'top-center' }
        );
      }
    } finally {
      setBusy(null);
    }
  };

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert
          severity="warning"
          action={
            <Button color="inherit" size="small" onClick={load}>
              Réessayer
            </Button>
          }>
          {error}
        </Alert>
      </Container>
    );
  }
  if (!page) return <LinearProgress sx={{ mt: 4 }} />;
  const { activity: a, students } = page;
  const present = students.filter((s) => s.attendance === 'présent').length;
  const left = students.filter((s) => !s.attendance).length;
  return (
    <Container maxWidth="sm" sx={{ mt: 3, mb: 6 }}>
      <Typography variant="overline" color="text.secondary">
        Sortie culturelle · {page.staff.name}
      </Typography>
      <Typography variant="h5" component="h1">
        {a.title}
      </Typography>
      <Typography
        color="text.secondary"
        sx={{ '&::first-letter': { textTransform: 'uppercase' } }}>
        {frDate(a.date)}
        {hours(a) ? ` · ${hours(a)}` : ''}
      </Typography>
      {(a.meeting_point || a.place) && (
        <Typography variant="body2" color="text.secondary">
          Aller :{' '}
          {pointChoices(a, 'aller')
            .map((c) => `${c.n}. ${c.text}`)
            .join(' · ') || a.place}
        </Typography>
      )}
      {a.return_point && (
        <Typography variant="body2" color="text.secondary">
          Retour :{' '}
          {pointChoices(a, 'retour')
            .map((c) => `${c.n}. ${c.text}`)
            .join(' · ')}
        </Typography>
      )}
      {a.bring && (
        <Typography variant="body2" color="text.secondary">
          À apporter : {a.bring}
        </Typography>
      )}
      {notice === 'offline' && (
        <Alert
          severity="warning"
          sx={{ mt: 2 }}
          action={
            <Button color="inherit" size="small" onClick={load}>
              Réessayer
            </Button>
          }>
          Pas de réseau : voici les informations reçues
          {syncedAt ? ` à ${clock(syncedAt)}` : ''}. Vos présences cochées sont
          gardées sur ce téléphone et envoyées dès que possible.
        </Alert>
      )}
      {notice === 'replaced' && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Ce lien n'est plus valable : l'association vous a peut-être envoyé un
          nouveau lien. Les informations reçues
          {syncedAt ? ` à ${clock(syncedAt)}` : ''} restent affichées, mais les
          présences ne peuvent plus être envoyées ici. Demandez le nouveau lien
          à l'association.
        </Alert>
      )}
      {queue.length > 0 && notice !== 'replaced' && (
        <Alert
          severity="info"
          sx={{ mt: 2 }}
          action={
            <Button color="inherit" size="small" onClick={flush}>
              Envoyer
            </Button>
          }>
          {queue.length} présence{queue.length > 1 ? 's' : ''} cochée
          {queue.length > 1 ? 's' : ''} sur ce téléphone, pas encore envoyée
          {queue.length > 1 ? 's' : ''}. Envoi automatique dès que le réseau
          revient.
        </Alert>
      )}
      {!page.open ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          La liste s'ouvre la veille de la sortie.
        </Alert>
      ) : (
        <>
          <Typography sx={{ mt: 2, mb: 1 }}>
            <b>{present}</b> présent{present > 1 ? 's' : ''} sur{' '}
            {students.length}
            {left ? ` · ${left} à cocher` : ''}
          </Typography>
          <Stack spacing={1}>
            {students.map((s) => (
              <Paper key={s.id} variant="outlined" sx={{ p: 1.5 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontWeight={600}>{s.name}</Typography>
                    <Typography
                      variant="caption"
                      color={
                        s.departure === 'seul'
                          ? 'warning.dark'
                          : 'text.secondary'
                      }
                      component="div">
                      {s.departure === 'seul'
                        ? 'Repart seul(e)'
                        : s.departure === 'accompagné'
                          ? 'Un adulte vient le/la chercher'
                          : 'Départ : non précisé'}
                      {s.consent ? '' : ' · autorisation manquante'}
                    </Typography>
                    {(studentPoint(a, s, 'aller') ||
                      studentPoint(a, s, 'retour')) && (
                      <Typography variant="body2" color="text.secondary">
                        {[
                          studentPoint(a, s, 'aller') &&
                            `Aller : ${studentPoint(a, s, 'aller')}`,
                          studentPoint(a, s, 'retour') &&
                            `Retour : ${studentPoint(a, s, 'retour')}`,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </Typography>
                    )}
                    {s.school && (
                      <Typography variant="body2" color="text.secondary">
                        {s.school}
                      </Typography>
                    )}
                    {s.phone && (
                      <Typography variant="body2" color="text.secondary">
                        Élève : <a href={`tel:${s.phone}`}>{showPhone(s.phone)}</a>
                      </Typography>
                    )}
                    {s.parent && (
                      <Typography variant="body2" color="text.secondary">
                        {s.parent.name ? `${s.parent.name} : ` : 'Parent : '}
                        <a href={`tel:${s.parent.phone}`}>
                          {showPhone(s.parent.phone)}
                        </a>
                      </Typography>
                    )}
                  </Box>
                  <Button
                    size="large"
                    variant={
                      s.attendance === 'présent' ? 'contained' : 'outlined'
                    }
                    color="success"
                    disabled={busy === s.id || notice === 'replaced'}
                    onClick={() => tick(s, 'présent')}>
                    Là
                  </Button>
                  <Button
                    size="large"
                    variant={
                      s.attendance === 'absent' ? 'contained' : 'outlined'
                    }
                    color="error"
                    disabled={busy === s.id || notice === 'replaced'}
                    onClick={() => tick(s, 'absent')}>
                    Absent
                  </Button>
                </Stack>
              </Paper>
            ))}
          </Stack>
          <Typography
            variant="caption"
            color="text.secondary"
            component="p"
            sx={{ mt: 2 }}>
            Chaque choix est enregistré aussitôt. Touchez de nouveau pour
            annuler.
          </Typography>
        </>
      )}
    </Container>
  );
};

export default AttendancePage;
