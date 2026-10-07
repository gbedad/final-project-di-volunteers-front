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
import PairDialog, { AlertChips } from './PairDialog';
import { formatHours } from './Sessions';

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
  const [following, setFollowing] = useState(null);
  const [freeTutor, setFreeTutor] = useState(null);

  const setInactive = async () => {
    try {
      await axios.patch(`${BASE_URL}/update-active-user/${freeTutor.id}`, {
        isActive: false,
      });
      toast.success(`${freeTutor.name} est maintenant tuteur inactif`, {
        position: 'bottom-left',
      });
    } catch {
      toast.error("Le tuteur n'a pas pu être modifié", {
        position: 'bottom-left',
      });
    }
    setFreeTutor(null);
  };

  const load = useCallback(() => {
    axios
      .get(`${BASE_URL}/admin/students/${student.id}/binomes`)
      .then(({ data }) => setPairs(data))
      .catch(() => setPairs([]));
  }, [student.id]);
  useEffect(load, [load]);

  const act = async (pair, action, extra = {}) => {
    try {
      const { data } = await axios.patch(
        `${BASE_URL}/admin/binomes/${pair.id}`,
        {
          action,
          ...extra,
        }
      );
      load();
      onChanged?.();
      // Last student of this tutor: ask whether the tutor stays active
      if (data.tutorFree) setFreeTutor(data.tutorFree);
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
      {pair.stats && pair.stats.sessions > 0 && (
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          {pair.stats.held} séance{pair.stats.held > 1 ? 's' : ''} ·{' '}
          {formatHours(pair.stats.hours)} · dernier compte-rendu le{' '}
          {formatDate(pair.stats.last_report)}
        </Typography>
      )}
      {pair.stats?.alerts?.length > 0 && (
        <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 0.5 }}>
          <AlertChips alerts={pair.stats.alerts} />
        </Stack>
      )}
      {pair.end_reason && (
        <Typography variant="body2" color="text.secondary">
          Fin : {pair.end_reason}
        </Typography>
      )}
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        {/* Follow-up: the whole team; changes: admins only */}
        {['actif', 'en pause', 'terminé'].includes(pair.status) && (
          <Button size="small" onClick={() => setFollowing(pair)}>
            Voir le suivi
          </Button>
        )}
        {canEdit && pair.status === 'proposé' && (
          <Button size="small" onClick={() => act(pair, 'cancel')}>
            Annuler la proposition
          </Button>
        )}
        {canEdit && pair.status === 'actif' && (
          <Button size="small" onClick={() => act(pair, 'pause')}>
            Mettre en pause
          </Button>
        )}
        {canEdit && pair.status === 'en pause' && (
          <Button size="small" onClick={() => act(pair, 'resume')}>
            Reprendre
          </Button>
        )}
        {canEdit && ['actif', 'en pause'].includes(pair.status) && (
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

      <Dialog open={!!freeTutor} onClose={() => setFreeTutor(null)}>
        <DialogTitle>{freeTutor?.name} n'a plus d'élève</DialogTitle>
        <DialogContent>
          <Typography>
            Le passer en tuteur inactif ? Il pourra toujours être proposé à un
            autre élève (« Tous les validés »), et redeviendra actif s'il
            accepte.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFreeTutor(null)}>
            Non, il reste actif
          </Button>
          <Button variant="contained" onClick={setInactive}>
            Oui, le passer inactif
          </Button>
        </DialogActions>
      </Dialog>

      <PairDialog
        pair={following && { ...following, student }}
        onClose={() => setFollowing(null)}
        showStudentLink={false}
      />

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
