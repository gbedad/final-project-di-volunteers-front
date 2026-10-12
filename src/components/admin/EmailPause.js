import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const EVENT = 'email-pause-changed';
const role = () => {
  try {
    return JSON.parse(localStorage.getItem('user'))?.user?.role;
  } catch {
    return null;
  }
};
const frDateTime = (d) =>
  new Date(d).toLocaleString('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });

const usePause = () => {
  const [state, setState] = useState(null);
  const load = useCallback(() => {
    if (!['superadmin', 'admin', 'interviewer'].includes(role())) return;
    axios
      .get(`${BASE_URL}/admin/email-pause`)
      .then(({ data }) => setState(data))
      .catch(() => setState(null));
  }, []);
  useEffect(() => {
    load();
    const timer = setInterval(load, 60000);
    window.addEventListener(EVENT, load);
    return () => {
      clearInterval(timer);
      window.removeEventListener(EVENT, load);
    };
  }, [load]);
  return [state, setState];
};

// Orange banner for the whole team while the volunteers' e-mails are paused
export const EmailPauseBanner = () => {
  const [state] = usePause();
  const { pathname } = useLocation();
  // Read again after logging in and on each page
  useEffect(() => {
    window.dispatchEvent(new Event(EVENT));
  }, [pathname]);
  if (!state?.pause) return null;
  return (
    <Alert
      severity="warning"
      sx={{ borderRadius: 0, justifyContent: 'center' }}>
      E-mails aux bénévoles en pause jusqu'au {frDateTime(state.pause.until)}
      {state.pause.by_name ? ` (activée par ${state.pause.by_name})` : ''} : ils
      sont retenus, pas envoyés.
      {state.withheld ? ` ${state.withheld} e-mail(s) retenu(s).` : ''}
    </Alert>
  );
};

// Withheld e-mails: read, send a selection, or drop them
const WithheldDialog = ({ open, onClose, onChanged }) => {
  const [rows, setRows] = useState(null);
  const [selected, setSelected] = useState([]);
  const [shown, setShown] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => {
    setRows(null);
    axios
      .get(`${BASE_URL}/admin/withheld-emails`)
      .then(({ data }) => setRows(data))
      .catch(() => setRows([]));
  }, []);
  useEffect(() => {
    if (open) {
      setSelected([]);
      load();
    }
  }, [open, load]);

  const act = async (action) => {
    setBusy(true);
    try {
      const { data } = await axios.post(`${BASE_URL}/admin/withheld-emails`, {
        ids: selected,
        action,
      });
      toast.success(
        action === 'send'
          ? `${data.sent} e-mail(s) envoyé(s)`
          : `${data.discarded} e-mail(s) écarté(s)`,
        { position: 'bottom-left' }
      );
      setSelected([]);
      load();
      onChanged();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action impossible', {
        position: 'bottom-left',
      });
    } finally {
      setBusy(false);
    }
  };
  const all = rows || [];
  const toggle = (id) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
    );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>E-mails retenus pendant la pause</DialogTitle>
      <DialogContent>
        {rows === null ? (
          <Typography variant="body2">Chargement…</Typography>
        ) : all.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Aucun e-mail retenu.
          </Typography>
        ) : (
          <Stack spacing={0.5}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selected.length === all.length}
                  indeterminate={
                    selected.length > 0 && selected.length < all.length
                  }
                  onChange={(e) =>
                    setSelected(e.target.checked ? all.map((r) => r.id) : [])
                  }
                />
              }
              label={
                <Typography variant="body2">
                  Tout sélectionner ({all.length})
                </Typography>
              }
            />
            {all.map((r) => (
              <Stack key={r.id} direction="row" alignItems="center" spacing={1}>
                <Checkbox
                  size="small"
                  checked={selected.includes(r.id)}
                  onChange={() => toggle(r.id)}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" noWrap>
                    <b>{r.subject}</b>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {r.recipients} · {frDateTime(r.created_at)}
                  </Typography>
                </Box>
                <Button size="small" onClick={() => setShown(r)}>
                  Voir
                </Button>
              </Stack>
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
        <Button
          color="error"
          disabled={!selected.length || busy}
          onClick={() => act('discard')}>
          Ne pas envoyer
        </Button>
        <Button
          variant="contained"
          disabled={!selected.length || busy}
          onClick={() => act('send')}>
          Envoyer la sélection
        </Button>
      </DialogActions>
      <Dialog
        open={!!shown}
        onClose={() => setShown(null)}
        fullWidth
        maxWidth="sm">
        <DialogTitle>{shown?.subject}</DialogTitle>
        <DialogContent>
          <Typography variant="caption" color="text.secondary">
            À : {shown?.recipients}
          </Typography>
          {/* E-mail written by the application itself */}
          <Box
            sx={{ mt: 1 }}
            dangerouslySetInnerHTML={{ __html: shown?.html || '' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShown(null)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

// Superadmin switch, at the top of the tutors list
export const EmailPauseControl = () => {
  const [state, setState] = usePause();
  const [hours, setHours] = useState(24);
  const [showWithheld, setShowWithheld] = useState(false);
  if (role() !== 'superadmin' || !state) return null;
  const active = !!state.pause;

  const toggle = async (on) => {
    try {
      const { data } = await axios.put(`${BASE_URL}/admin/email-pause`, {
        active: on,
        hours,
      });
      setState(data);
      window.dispatchEvent(new Event(EVENT));
      toast.success(
        on
          ? 'E-mails aux bénévoles en pause'
          : 'E-mails aux bénévoles réactivés',
        {
          position: 'bottom-left',
        }
      );
      if (!on && data.withheld) setShowWithheld(true);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Modification impossible', {
        position: 'bottom-left',
      });
    }
  };

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      flexWrap="wrap"
      useFlexGap>
      <FormControlLabel
        control={
          <Switch
            checked={active}
            color="warning"
            onChange={(e) => toggle(e.target.checked)}
          />
        }
        label={
          <Typography variant="body2">
            Pause des e-mails aux bénévoles
          </Typography>
        }
      />
      {!active && (
        <TextField
          select
          size="small"
          label="Durée"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          sx={{ width: 120 }}>
          {[2, 8, 24, 48, 168].map((h) => (
            <MenuItem key={h} value={h}>
              {h < 24
                ? `${h} h`
                : h === 168
                  ? '7 jours'
                  : `${h / 24} jour${h > 24 ? 's' : ''}`}
            </MenuItem>
          ))}
        </TextField>
      )}
      {(active || state.withheld > 0) && (
        <Button size="small" onClick={() => setShowWithheld(true)}>
          E-mails retenus ({state.withheld})
        </Button>
      )}
      <WithheldDialog
        open={showWithheld}
        onClose={() => setShowWithheld(false)}
        onChanged={() => window.dispatchEvent(new Event(EVENT))}
      />
    </Stack>
  );
};
