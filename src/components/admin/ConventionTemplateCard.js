import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DescriptionIcon from '@mui/icons-material/Description';

const BASE_URL = process.env.REACT_APP_BASE_URL;

// Model of the convention downloaded by the volunteers; the team replaces
// it with a new version (e.g. each school year)
const ConventionTemplateCard = ({ canReplace }) => {
  const [template, setTemplate] = useState(undefined);
  const [uploading, setUploading] = useState(false);
  const input = useRef(null);

  const load = useCallback(() => {
    axios
      .get(`${BASE_URL}/convention/template`)
      .then(({ data }) => setTemplate(data.template))
      .catch(() => setTemplate(null));
  }, []);
  useEffect(load, [load]);

  const upload = async (event) => {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      await axios.post(`${BASE_URL}/admin/convention/template`, formData);
      toast.success('Nouveau modèle de convention en ligne', {
        position: 'bottom-left',
      });
      load();
    } catch (err) {
      toast.error("Le modèle n'a pas pu être déposé", {
        position: 'bottom-left',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
        <DescriptionIcon color="primary" />
        <Typography sx={{ flex: 1, minWidth: 240 }}>
          <b>Modèle de convention</b>
          <br />
          <Typography component="span" variant="body2" color="text.secondary">
            {template
              ? `${template.filename} · déposé le ${new Date(
                  template.updated_at
                ).toLocaleDateString('fr-FR')}`
              : template === null
                ? 'Aucun modèle déposé : les bénévoles téléchargent l’ancien modèle intégré au site.'
                : 'Chargement…'}
          </Typography>
        </Typography>
        {template && (
          <Button
            size="small"
            startIcon={<CloudDownloadIcon />}
            href={template.url}>
            Télécharger
          </Button>
        )}
        {canReplace && (
          <>
            <input
              ref={input}
              type="file"
              hidden
              accept=".pdf,.doc,.docx"
              onChange={upload}
            />
            <Button
              size="small"
              variant="outlined"
              disabled={uploading}
              startIcon={
                uploading ? <CircularProgress size={16} /> : <UploadFileIcon />
              }
              onClick={() => input.current.click()}>
              {template ? 'Remplacer le modèle' : 'Déposer le modèle'}
            </Button>
          </>
        )}
      </Stack>
    </Paper>
  );
};

export default ConventionTemplateCard;
