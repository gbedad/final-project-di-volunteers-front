import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const formatDate = (v) => (v ? new Date(v).toLocaleDateString('fr-FR') : '');
const STATUS = {
  proposé: { label: 'Proposition', color: 'warning' },
  actif: { label: 'En cours', color: 'success' },
  'en pause': { label: 'En pause', color: 'default' },
  terminé: { label: 'Terminé', color: 'default' },
};

const Line = ({ label, children }) =>
  children ? (
    <Typography variant="body2">
      <Typography component="span" variant="body2" color="text.secondary">
        {label} :{' '}
      </Typography>
      {children}
    </Typography>
  ) : null;

// The tutor's students: proposals to answer, current and past pairs. The
// family is contacted through the association.
const MyStudents = () => {
  const [pairs, setPairs] = useState(null);
  const [declining, setDeclining] = useState(null);
  const [reason, setReason] = useState('');

  const load = useCallback(() => {
    axios
      .get(`${BASE_URL}/my/binomes`)
      .then(({ data }) => setPairs(data))
      .catch(() => setPairs([]));
  }, []);
  useEffect(load, [load]);

  const answer = async (pair, accept, declineReason) => {
    try {
      await axios.post(`${BASE_URL}/my/binomes/${pair.id}/answer`, {
        accept,
        reason: declineReason,
      });
      toast.success(
        accept
          ? `Merci ! Vous accompagnez ${pair.student.first_name}. L'association vous met en relation avec la famille.`
          : 'Votre réponse est enregistrée.',
        { position: 'top-center', duration: 6000 }
      );
      load();
    } catch (err) {
      toast.error(
        err.response?.data?.error || "La réponse n'a pas pu être enregistrée",
        {
          position: 'top-center',
        }
      );
    }
  };

  if (pairs === null) return <LinearProgress />;
  if (!pairs.length) {
    return (
      <Alert severity="info" sx={{ maxWidth: 820, mx: 'auto', my: 2 }}>
        Aucun élève pour l'instant. L'association vous proposera un élève qui
        correspond à vos souhaits et à vos disponibilités.
      </Alert>
    );
  }

  return (
    <Stack spacing={2} sx={{ maxWidth: 820, mx: 'auto', my: 2 }}>
      {pairs.map((pair) => {
        const s = pair.student;
        return (
          <Paper
            key={pair.id}
            variant="outlined"
            sx={{
              p: 2,
              borderColor:
                pair.status === 'proposé' ? 'warning.main' : undefined,
            }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}>
              <Typography variant="h6">
                {s.first_name} {s.initial}
                <Typography component="span" color="text.secondary">
                  {' '}
                  · {[s.level, s.track].filter(Boolean).join(' ')}
                </Typography>
              </Typography>
              <Chip
                size="small"
                color={STATUS[pair.status]?.color}
                label={STATUS[pair.status]?.label || pair.status}
              />
            </Stack>
            <Stack spacing={0.5}>
              <Line label="Matière(s)">{pair.subjects.join(', ')}</Line>
              <Line label="Objectifs">{(s.goals || []).join(', ')}</Line>
              <Line label="Besoins">{s.needs}</Line>
              <Line label="Créneau">
                {(pair.schedule || [])
                  .map((x) => `${x.day} ${x.startTime}–${x.endTime}`)
                  .join(', ') || 'à convenir'}
              </Line>
              <Line label="Lieu">
                {[pair.how_location, pair.site].filter(Boolean).join(' · ')}
              </Line>
              <Line label="Établissement">
                {s.school &&
                  [s.school.type, s.school.city].filter(Boolean).join(', ')}
              </Line>
              <Line label="Début">{formatDate(pair.start_date)}</Line>
              {pair.note && (
                <Line label="Message de l'association">{pair.note}</Line>
              )}
            </Stack>
            {pair.status === 'proposé' ? (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Acceptez-vous d'accompagner {s.first_name} ?
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    onClick={() => answer(pair, true)}>
                    J'accepte
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setReason('');
                      setDeclining(pair);
                    }}>
                    Je ne peux pas
                  </Button>
                </Stack>
              </Box>
            ) : pair.status === 'actif' ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Pour toute question sur {s.first_name} ou sa famille, contactez
                l'association.
              </Typography>
            ) : null}
          </Paper>
        );
      })}

      <Dialog
        open={!!declining}
        onClose={() => setDeclining(null)}
        fullWidth
        maxWidth="xs">
        <DialogTitle>
          Vous ne pouvez pas accompagner {declining?.student.first_name} ?
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={2}
            size="small"
            label="Pourquoi ? (facultatif)"
            placeholder="Créneau, niveau, nombre d'élèves…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeclining(null)}>Retour</Button>
          <Button
            variant="contained"
            onClick={() => {
              answer(declining, false, reason);
              setDeclining(null);
            }}>
            Envoyer ma réponse
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default MyStudents;
