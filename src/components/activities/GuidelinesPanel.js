import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Alert,
  Box,
  Button,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import { BASE_URL } from './activityUtils';
import { Preview, WhatsappEditor } from './WhatsappEditor';

const MAX = 10000;
const URL_GUIDELINES = `${BASE_URL}/admin/consignes-sorties`;

const when = (at) =>
  new Date(at).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  });

// "Consignes" of the outings: one text for all of them, written in the
// WhatsApp format, saved, and copied into the messages to the families
const GuidelinesPanel = ({ canEdit }) => {
  const [saved, setSaved] = useState(null);
  const [text, setText] = useState('');
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios
      .get(URL_GUIDELINES)
      .then(({ data }) => {
        setSaved(data);
        setText(data.body || '');
      })
      .catch(() => setError(true));
  }, []);
  const dirty = saved !== null && text !== (saved.body || '');
  // Leaving the page with text not saved
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await axios.put(URL_GUIDELINES, { body: text });
      setSaved(data);
      toast.success('Consignes enregistrées', { position: 'bottom-left' });
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          "Les consignes n'ont pas pu être enregistrées",
        { position: 'bottom-left' }
      );
    } finally {
      setSaving(false);
    }
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copié : collez dans WhatsApp', {
        position: 'bottom-left',
      });
    } catch {
      toast.error('Copie impossible : sélectionnez le texte à la main', {
        position: 'bottom-left',
      });
    }
  };
  const canShare = typeof navigator !== 'undefined' && !!navigator.share;
  const share = async () => {
    try {
      await navigator.share({ text });
    } catch (err) {
      if (err?.name !== 'AbortError') copy();
    }
  };

  if (error) {
    return (
      <Alert severity="error">Les consignes n'ont pas pu être chargées.</Alert>
    );
  }
  if (saved === null) return <LinearProgress />;

  return (
    <Stack spacing={2} sx={{ maxWidth: 720 }}>
      <Typography variant="body2" color="text.secondary">
        Un texte pour toutes les sorties, au format WhatsApp : ce que vous voyez
        dans l'aperçu est ce que les familles recevront après la copie.
      </Typography>
      {canEdit ? (
        <WhatsappEditor
          value={text}
          onChange={setText}
          max={MAX}
          placeholder={
            "Ex. :\n*Rendez-vous* 📍 devant le musée à 14 h\n- pièce d'identité\n- goûter dans le sac"
          }
        />
      ) : (
        !text.trim() && (
          <Alert severity="info">Aucune consigne rédigée pour l'instant.</Alert>
        )
      )}
      {canEdit && (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap>
          <Button
            variant="contained"
            disabled={!dirty || saving}
            onClick={save}>
            Enregistrer
          </Button>
          {dirty && (
            <Chip size="small" color="warning" label="Pas encore enregistré" />
          )}
        </Stack>
      )}
      {saved.updated_at && (
        <Typography variant="caption" color="text.secondary">
          Dernière modification le {when(saved.updated_at)}
          {saved.updated_by ? ` par ${saved.updated_by}` : ''}.
        </Typography>
      )}
      {text.trim() && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 0.75 }}>
            Aperçu dans WhatsApp
          </Typography>
          <Preview text={text} />
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
            sx={{ mt: 1.5 }}>
            <Button
              variant="outlined"
              startIcon={<ContentCopyIcon />}
              onClick={copy}>
              Copier pour WhatsApp
            </Button>
            {canShare && (
              <Button
                variant="outlined"
                startIcon={<ShareIcon />}
                onClick={share}>
                Partager
              </Button>
            )}
          </Stack>
        </Box>
      )}
    </Stack>
  );
};

export default GuidelinesPanel;
