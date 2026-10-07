import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

// Archiving of one or several former volunteers: reason, sensitive
// documents deleted (ticked by default), what it changes
const ArchiveDialog = ({ open, title, onClose, onConfirm, blocked }) => {
  const [reason, setReason] = useState('');
  const [deleteSensitive, setDeleteSensitive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setReason('');
      setDeleteSensitive(true);
      setSaving(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            autoFocus
            size="small"
            label="Motif"
            placeholder="Déménagement, plus disponible, fin d'engagement…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={deleteSensitive}
                onChange={(e) => setDeleteSensitive(e.target.checked)}
              />
            }
            label="Supprimer l'extrait de casier judiciaire (B3) et la pièce d'identité"
          />
          <Typography variant="body2" color="text.secondary">
            Le compte, les cohortes, les binômes et l'historique sont conservés.
            Le bénévole ne pourra plus se connecter et n'apparaîtra plus au
            quotidien (étiquette « Archivés » pour le retrouver). Il peut être
            désarchivé à tout moment.
          </Typography>
          {blocked?.length > 0 && (
            <Alert severity="warning">
              {blocked.map((b) => (
                <div key={b.id}>
                  {b.name ? `${b.name} : ` : ''}
                  {b.error}
                  {b.openPairs?.length
                    ? ` (${b.openPairs.map((p) => p.student).join(', ')})`
                    : ''}
                </div>
              ))}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          variant="contained"
          color="warning"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            await onConfirm({ reason, deleteSensitive });
            setSaving(false);
          }}>
          Archiver
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ArchiveDialog;
