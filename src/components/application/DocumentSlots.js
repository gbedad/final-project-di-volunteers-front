import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import FileDisplay from '../FileDisplay';
import { isManager } from '../../js/roles';
import {
  notifyApplicationChanged,
  useApplicationProgress,
} from '../../js/applicationProgress';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const SLOTS = [
  {
    type: 'cv',
    label: 'CV',
    hint: "Et / ou diplômes, certificats d'aptitudes professionnelles, attestations d'expérience, etc.",
    required: true,
  },
  {
    type: 'id',
    label: "Pièce d'identité",
    hint: 'Recto et verso',
    required: true,
  },
  {
    type: 'b3',
    label: 'Extrait de casier judiciaire (extrait B3)',
    hint: 'À fournir avant la signature de la convention',
  },
  {
    type: 'honorability',
    label: "Attestation d'honorabilité",
    hint: 'À fournir au plus tard un mois après la signature de la convention',
  },
  {
    type: 'other',
    label: 'Autres documents',
    hint: 'Diplômes, attestations…',
  },
];

// Files lost with the old storage can no longer be opened
const isLost = (file) => file.path.includes('amazonaws.com');

const currentRole = () => {
  try {
    return JSON.parse(localStorage.getItem('user'))?.user?.role;
  } catch {
    return null;
  }
};

const Slot = ({ slot, files, userId, canDelete, onChanged, onView, due }) => {
  const input = useRef(null);
  const [uploading, setUploading] = useState(false);
  const available = files.filter((f) => !isLost(f));

  const upload = async (event) => {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      await axios.post(`${BASE_URL}/upload/${userId}`, formData, {
        params: { type: slot.type },
      });
      toast.success(`${slot.label} : fichier déposé`, {
        position: 'bottom-left',
      });
      onChanged();
    } catch (err) {
      toast.error("Le fichier n'a pas pu être déposé", {
        position: 'bottom-left',
      });
    } finally {
      setUploading(false);
    }
  };

  const remove = async (file) => {
    try {
      await axios.delete(`${BASE_URL}/files/cancel/${file.id}`);
      onChanged();
    } catch (err) {
      toast.error('Suppression impossible', { position: 'bottom-left' });
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        {available.length > 0 && <CheckCircleIcon color="success" />}
        <Box sx={{ flex: 1 }}>
          <Typography fontWeight={600}>
            {slot.label}
            {slot.required && (
              <Typography component="span" color="error.main">
                {' '}
                *
              </Typography>
            )}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {slot.hint}
          </Typography>
          {due && available.length === 0 && (
            <Typography
              variant="body2"
              color={new Date(due) < new Date() ? 'error.main' : 'warning.dark'}
              sx={{ fontWeight: 500 }}>
              À fournir avant le {new Date(due).toLocaleDateString('fr-FR')}
            </Typography>
          )}
        </Box>
        <input
          ref={input}
          type="file"
          hidden
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={upload}
        />
        <Button
          variant={available.length ? 'text' : 'contained'}
          startIcon={
            uploading ? <CircularProgress size={16} /> : <UploadFileIcon />
          }
          disabled={uploading}
          onClick={() => input.current.click()}>
          {available.length ? 'Ajouter' : 'Déposer'}
        </Button>
      </Stack>

      {files.map((file) => (
        <Stack
          key={file.id}
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ mt: 1, pl: 4 }}>
          <Typography variant="body2" sx={{ flex: 1, wordBreak: 'break-all' }}>
            {file.filename}
          </Typography>
          {isLost(file) ? (
            <Chip
              size="small"
              color="warning"
              label="Fichier perdu, à redéposer"
            />
          ) : (
            <Tooltip title="Voir">
              <IconButton size="small" onClick={() => onView(file.path)}>
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title="Supprimer">
              <IconButton size="small" onClick={() => remove(file)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      ))}
    </Paper>
  );
};

const DocumentSlots = ({ userId, onChanged }) => {
  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState(null);
  // Due date of the attestation d'honorabilité, once the convention is signed
  const [progress] = useApplicationProgress(userId);
  const role = currentRole();
  // Volunteers manage their own files; interviewers cannot delete
  const canDelete = role === 'volunteer' || isManager(role);

  const load = useCallback(async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/user-by-id/${userId}`);
      setFiles((data.file || []).filter((f) => f.doc_type !== 'convention'));
    } catch (err) {
      console.error(err);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) load();
  }, [userId, load]);

  const changed = () => {
    load();
    notifyApplicationChanged();
    onChanged?.();
  };

  // Files uploaded before typed slots existed are shown as "other"
  const filesOf = (type) =>
    files.filter((f) => (f.doc_type || 'other') === type);

  return (
    <Stack spacing={2} sx={{ maxWidth: 720, mx: 'auto', my: 2 }}>
      {SLOTS.map((slot) => (
        <Slot
          key={slot.type}
          slot={slot}
          files={filesOf(slot.type)}
          userId={userId}
          canDelete={canDelete}
          onChanged={changed}
          onView={setPreview}
          due={slot.type === 'honorability' ? progress?.honorabilityDue : null}
        />
      ))}
      {preview && (
        <FileDisplay
          s3FilePath={preview}
          open={!!preview}
          handleClose={() => setPreview(null)}
        />
      )}
    </Stack>
  );
};

export default DocumentSlots;
