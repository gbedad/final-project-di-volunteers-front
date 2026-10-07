import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import MatchDialog from './MatchDialog';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const formatDate = (v) => (v ? new Date(v).toLocaleDateString('fr-FR') : '');

export const PAIR_STATUS = {
  proposé: { label: 'Proposé, en attente du tuteur', color: 'warning' },
  actif: { label: 'Actif', color: 'success' },
  'en pause': { label: 'En pause', color: 'default' },
  terminé: { label: 'Terminé', color: 'default' },
  refusé: { label: 'Refusé par le tuteur', color: 'error' },
  annulé: { label: 'Proposition annulée', color: 'default' },
};

// Tutor(s) of a student: pairs, actions, and the search for a tutor
const StudentPairs = ({ student, canEdit, onChanged }) => {
  const [pairs, setPairs] = useState([]);
  const [searching, setSearching] = useState(false);
  const [ending, setEnding] = useState(null);
  const [reason, setReason] = useState('');

  const load = useCallback(() => {
    axios
      .get(`${BASE_URL}/admin/students/${student.id}/binomes`)
      .then(({ data }) => setPairs(data))
      .catch(() => setPairs([]));
  }, [student.id]);
  useEffect(load, [load]);

  const act = async (pair, action, extra = {}) => {
    try {
      await axios.patch(`${BASE_URL}/admin/binomes/${pair.id}`, {
        action,
        ...extra,
      });
      load();
      onChanged?.();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action impossible', {
        position: 'bottom-left',
      });
    }
  };

  const open = pairs.filter((p) =>
    ['proposé', 'actif', 'en pause'].includes(p.status)
  );
  const past = pairs.filter((p) => !open.includes(p));

  const PairCard = ({ pair }) => (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        gap={1}
        flexWrap="wrap">
        <Typography fontWeight={600}>
          {pair.tutor
            ? `${pair.tutor.first_name} ${pair.tutor.last_name}`
            : 'Tuteur supprimé'}
        </Typography>
        <Chip
          size="small"
          color={PAIR_STATUS[pair.status]?.color}
          label={PAIR_STATUS[pair.status]?.label || pair.status}
        />
      </Stack>
      <Typography variant="body2" color="text.secondary">
        {[
          pair.subjects.join(', '),
          (pair.schedule || [])
            .map((s) => `${s.day} ${s.startTime}–${s.endTime}`)
            .join(', '),
          [pair.how_location, pair.site].filter(Boolean).join(' · '),
        ]
          .filter(Boolean)
          .join(' · ')}
      </Typography>
      <Typography variant="caption" color="text.secondary" component="div">
        Proposé le {formatDate(pair.proposed_at)}
        {pair.responded_at && ` · réponse le ${formatDate(pair.responded_at)}`}
        {pair.start_date && ` · début ${formatDate(pair.start_date)}`}
        {pair.ended_at && ` · terminé le ${formatDate(pair.ended_at)}`}
      </Typography>
      {pair.decline_reason && (
        <Typography variant="body2" color="error.main">
          Motif du refus : {pair.decline_reason}
        </Typography>
      )}
      {pair.end_reason && (
        <Typography variant="body2" color="text.secondary">
          Fin : {pair.end_reason}
        </Typography>
      )}
      {canEdit && (
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          {pair.status === 'proposé' && (
            <Button size="small" onClick={() => act(pair, 'cancel')}>
              Annuler la proposition
            </Button>
          )}
          {pair.status === 'actif' && (
            <Button size="small" onClick={() => act(pair, 'pause')}>
              Mettre en pause
            </Button>
          )}
          {pair.status === 'en pause' && (
            <Button size="small" onClick={() => act(pair, 'resume')}>
              Reprendre
            </Button>
          )}
          {['actif', 'en pause'].includes(pair.status) && (
            <Button
              size="small"
              color="error"
              onClick={() => {
                setReason('');
                setEnding(pair);
              }}>
              Terminer
            </Button>
          )}
        </Stack>
      )}
    </Paper>
  );

  return (
    <Stack spacing={1.5}>
      {open.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          Aucun tuteur pour l'instant.
        </Typography>
      )}
      {open.map((p) => (
        <PairCard key={p.id} pair={p} />
      ))}
      {canEdit && (
        <Button
          variant="contained"
          startIcon={<PersonSearchIcon />}
          onClick={() => setSearching(true)}
          sx={{ alignSelf: 'flex-start' }}>
          Trouver un tuteur
        </Button>
      )}
      {past.length > 0 && (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ pt: 1 }}>
            Historique
          </Typography>
          {past.map((p) => (
            <PairCard key={p.id} pair={p} />
          ))}
        </>
      )}

      <MatchDialog
        open={searching}
        student={student}
        onClose={() => setSearching(false)}
        onProposed={() => {
          load();
          onChanged?.();
        }}
      />

      <Dialog
        open={!!ending}
        onClose={() => setEnding(null)}
        fullWidth
        maxWidth="xs">
        <DialogTitle>Terminer ce binôme ?</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={2}
            size="small"
            label="Motif et bilan"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEnding(null)}>Annuler</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              act(ending, 'end', { reason });
              setEnding(null);
            }}>
            Terminer
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default StudentPairs;
