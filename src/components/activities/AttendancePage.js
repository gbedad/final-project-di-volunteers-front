import React, { useCallback, useEffect, useState } from 'react';
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
import { BASE_URL, frDate, hours } from './activityUtils';

// The adult going with the students ticks who is there, on their phone,
// through their own link (no account)
const AttendancePage = () => {
  const { token } = useParams();
  const [page, setPage] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);
  const load = useCallback(() => {
    axios
      .get(`${BASE_URL}/sortie/${token}`)
      .then(({ data }) => setPage(data))
      .catch((err) =>
        setError(err.response?.data?.error || 'Page indisponible')
      );
  }, [token]);
  useEffect(load, [load]);

  const tick = async (s, attendance) => {
    setBusy(s.id);
    const value = s.attendance === attendance ? null : attendance;
    try {
      await axios.post(`${BASE_URL}/sortie/${token}`, {
        registration_id: s.id,
        attendance: value,
      });
      setPage((p) => ({
        ...p,
        students: p.students.map((x) =>
          x.id === s.id ? { ...x, attendance: value } : x
        ),
      }));
    } catch (err) {
      toast.error(
        err.response?.data?.error || "La présence n'a pas pu être enregistrée",
        {
          position: 'top-center',
        }
      );
    } finally {
      setBusy(null);
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
          Rendez-vous : {a.meeting_point || a.place}
          {a.meeting_time ? ` à ${a.meeting_time}` : ''}
          {a.meeting_point2
            ? ` · ou ${a.meeting_point2}${a.meeting_time2 ? ` à ${a.meeting_time2}` : ''}`
            : ''}
        </Typography>
      )}
      {a.bring && (
        <Typography variant="body2" color="text.secondary">
          À apporter : {a.bring}
        </Typography>
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
                    {s.parent && (
                      <Typography variant="body2" color="text.secondary">
                        {s.parent.name ? `${s.parent.name} : ` : 'Parent : '}
                        <a href={`tel:${s.parent.phone}`}>{s.parent.phone}</a>
                      </Typography>
                    )}
                  </Box>
                  <Button
                    size="large"
                    variant={
                      s.attendance === 'présent' ? 'contained' : 'outlined'
                    }
                    color="success"
                    disabled={busy === s.id}
                    onClick={() => tick(s, 'présent')}>
                    Là
                  </Button>
                  <Button
                    size="large"
                    variant={
                      s.attendance === 'absent' ? 'contained' : 'outlined'
                    }
                    color="error"
                    disabled={busy === s.id}
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
