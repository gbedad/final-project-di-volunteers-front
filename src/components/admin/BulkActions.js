import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import PersonIcon from '@mui/icons-material/Person';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import { existingStatuses } from '../../options/existingOptions';
import { isManager } from '../../js/roles';

const BASE_URL = process.env.REACT_APP_BASE_URL;
// Statuses that send an email to the volunteer
const EMAIL_STATUSES = ['A finaliser', 'Validé'];

const currentRole = () => {
  try {
    return JSON.parse(localStorage.getItem('user'))?.user?.role;
  } catch {
    return null;
  }
};

const plural = (n, word) => `${n} ${word}${n > 1 ? 's' : ''}`;

// Actions on the volunteers ticked in the dashboard
const BulkActions = ({ rows, onDone }) => {
  const [statusMenu, setStatusMenu] = useState(null);
  // { label, changes } waiting for confirmation
  const [pending, setPending] = useState(null);
  const [saving, setSaving] = useState(false);
  const manager = isManager(currentRole());

  if (!rows.length) return null;

  const names = rows
    .slice(0, 5)
    .map((r) => `${r.first_name} ${r.last_name}`)
    .join(', ');
  const others = rows.length > 5 ? ` et ${rows.length - 5} autre(s)` : '';

  const copyEmails = () => {
    const emails = rows
      .map((r) => r.email)
      .filter(Boolean)
      .join(', ');
    navigator.clipboard
      .writeText(emails)
      .then(() =>
        toast.success(`${plural(rows.length, 'e-mail')} copié(s)`, {
          position: 'bottom-left',
        })
      )
      .catch(() =>
        toast.error('Copie impossible', { position: 'bottom-left' })
      );
  };

  const apply = async () => {
    setSaving(true);
    try {
      const { data } = await axios.patch(`${BASE_URL}/admin/users/bulk`, {
        ids: rows.map((r) => r.id),
        ...pending.changes,
      });
      toast.success(`${plural(data.updated.length, 'bénévole')} modifié(s)`, {
        position: 'bottom-left',
      });
      setPending(null);
      onDone();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Modification impossible', {
        position: 'bottom-left',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1,
        mb: 1,
        bgcolor: 'action.hover',
        borderColor: 'primary.main',
      }}>
      <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1}>
        <Typography sx={{ mx: 1, fontWeight: 600 }}>
          {plural(rows.length, 'sélectionné')}
        </Typography>
        {manager && (
          <>
            <Button
              variant="outlined"
              endIcon={<ArrowDropDownIcon />}
              onClick={(e) => setStatusMenu(e.currentTarget)}>
              Changer le statut
            </Button>
            <Button
              variant="outlined"
              startIcon={<PersonOffIcon />}
              onClick={() =>
                setPending({
                  label: 'passer en « tuteur inactif »',
                  changes: { is_active: false },
                })
              }>
              Rendre inactifs
            </Button>
            <Button
              variant="outlined"
              startIcon={<PersonIcon />}
              onClick={() =>
                setPending({
                  label: 'passer en « tuteur actif »',
                  changes: { is_active: true },
                })
              }>
              Rendre actifs
            </Button>
          </>
        )}
        <Button startIcon={<ContentCopyIcon />} onClick={copyEmails}>
          Copier les e-mails
        </Button>
      </Stack>

      <Menu
        anchorEl={statusMenu}
        open={!!statusMenu}
        onClose={() => setStatusMenu(null)}>
        {existingStatuses.map((status) => (
          <MenuItem
            key={status}
            onClick={() => {
              setStatusMenu(null);
              setPending({
                label: `passer au statut « ${status} »`,
                changes: { status },
              });
            }}>
            {status}
          </MenuItem>
        ))}
      </Menu>

      <Dialog open={!!pending} onClose={() => !saving && setPending(null)}>
        <DialogTitle>Confirmer la modification</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {plural(rows.length, 'bénévole')} {rows.length > 1 ? 'vont' : 'va'}{' '}
            {pending?.label} :
          </DialogContentText>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {names}
            {others}
          </Typography>
          {EMAIL_STATUSES.includes(pending?.changes?.status) && (
            <Typography variant="body2" color="warning.dark" sx={{ mt: 2 }}>
              Ce statut envoie un e-mail à chaque bénévole concerné.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPending(null)} disabled={saving}>
            Annuler
          </Button>
          <Button variant="contained" onClick={apply} disabled={saving}>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default BulkActions;
