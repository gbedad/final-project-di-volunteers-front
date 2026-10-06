import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';

import FileDisplay from '../FileDisplay';
import SaveStatus from '../application/SaveStatus';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const LABELS = {
  cv: 'CV',
  id: "Pièce d'identité",
  b3: 'Casier judiciaire (B3)',
  convention: 'Convention',
  honorability: "Attestation d'honorabilité",
};

// Due date of the attestation d'honorabilité, red once it has passed
const DueChip = ({ due }) =>
  due ? (
    <Chip
      size="small"
      variant="outlined"
      color={new Date(due) < new Date() ? 'error' : 'default'}
      label={`À fournir avant le ${formatDate(due)}`}
    />
  ) : null;

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('fr-FR') : '';

// Documents received for a volunteer, on the admin profile page: a document
// is received when a file is uploaded (ticked automatically) or when the
// admin ticks "Reçu sur papier". Every change is saved immediately.
const DocumentCheckbox = ({ user }) => {
  const [status, setStatus] = useState(null);
  const [saveState, setSaveState] = useState('idle');
  const [preview, setPreview] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${BASE_URL}/admin/users/${user.id}/documents`
      );
      setStatus(data);
    } catch (err) {
      console.error(err);
    }
  }, [user.id]);

  useEffect(() => {
    load();
  }, [load]);

  const update = async (body) => {
    setSaveState('saving');
    try {
      const { data } = await axios.patch(
        `${BASE_URL}/admin/users/${user.id}/documents`,
        body
      );
      setStatus(data);
      setSaveState('saved');
    } catch (err) {
      console.error(err);
      setSaveState('error');
    }
  };

  if (!status) return null;

  return (
    <Box sx={{ width: '100%' }}>
      <Stack spacing={1}>
        {status.documents.map((doc) => (
          <Stack
            key={doc.type}
            direction="row"
            alignItems="center"
            spacing={1}
            flexWrap="wrap">
            <Typography sx={{ minWidth: 170, fontWeight: 500 }}>
              {LABELS[doc.type]}
            </Typography>
            {doc.file ? (
              <>
                <Chip
                  size="small"
                  color="success"
                  icon={<CheckCircleIcon />}
                  label={`Déposé le ${formatDate(doc.file.uploaded_at)}`}
                />
                <Tooltip title={doc.file.filename}>
                  <IconButton
                    size="small"
                    aria-label={`Voir ${LABELS[doc.type]}`}
                    onClick={() => setPreview(doc.file.path)}>
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <FormControlLabel
                sx={{ m: 0 }}
                control={
                  <Checkbox
                    size="small"
                    checked={doc.paper}
                    onChange={(e) =>
                      update({ type: doc.type, paper: e.target.checked })
                    }
                  />
                }
                label={
                  <Typography variant="body2" color="text.secondary">
                    Reçu sur papier
                  </Typography>
                }
              />
            )}
            {doc.type === 'honorability' && !doc.received && (
              <DueChip due={status.honorability_due} />
            )}
          </Stack>
        ))}
        <Divider />
        <FormControlLabel
          sx={{ m: 0 }}
          control={
            <Checkbox
              size="small"
              checked={status.test_voltaire_passed}
              onChange={(e) => update({ voltaire: e.target.checked })}
            />
          }
          label="Test de français réussi (Voltaire ou autre)"
        />
        <Box sx={{ minHeight: 20 }}>
          <SaveStatus state={saveState} />
        </Box>
      </Stack>
      {preview && (
        <FileDisplay
          s3FilePath={preview}
          open={!!preview}
          handleClose={() => setPreview(null)}
        />
      )}
    </Box>
  );
};

export default DocumentCheckbox;
