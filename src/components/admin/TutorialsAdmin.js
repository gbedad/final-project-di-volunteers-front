import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  LinearProgress,
  Switch,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { loadTutorials, tutorialLink, tutorialPath } from '../../js/tutorials';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const MAX_MB = 100;
const mb = (n) =>
  `${(n / 1024 / 1024).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} Mo`;

// One tutorial: its video (sent, replaced or removed here), its link
const TutorialRow = ({ tutorial, canEdit, onChanged }) => {
  const input = useRef(null);
  const [progress, setProgress] = useState(null);
  const [removing, setRemoving] = useState(false);

  const send = async (event) => {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(
        `Vidéo trop lourde (${mb(file.size)}) : ${MAX_MB} Mo au maximum`,
        { position: 'bottom-left' }
      );
      return;
    }
    const form = new FormData();
    form.append('video', file);
    setProgress(0);
    try {
      await axios.post(
        `${BASE_URL}/admin/tutorials/${tutorial.slug}/video`,
        form,
        {
          // The upload can take a while on a phone connection
          timeout: 0,
          onUploadProgress: (e) =>
            setProgress(e.total ? Math.round((e.loaded * 100) / e.total) : 50),
        }
      );
      toast.success('Vidéo en ligne : le lien est déjà valable', {
        position: 'bottom-left',
      });
      onChanged();
    } catch (err) {
      toast.error(
        err.response?.data?.error || "La vidéo n'a pas pu être envoyée",
        { position: 'bottom-left' }
      );
    } finally {
      setProgress(null);
    }
  };

  const remove = async () => {
    try {
      await axios.delete(`${BASE_URL}/admin/tutorials/${tutorial.slug}/video`);
      setRemoving(false);
      onChanged();
    } catch (err) {
      toast.error(
        err.response?.data?.error || "La vidéo n'a pas pu être supprimée",
        { position: 'bottom-left' }
      );
    }
  };

  // The tutors see the video only once published here (the link works then)
  const publish = async (published) => {
    try {
      await axios.post(`${BASE_URL}/admin/tutorials/${tutorial.slug}/publication`, { published });
      toast.success(published ? 'Publié : les tuteurs voient le tutoriel.' : 'Retiré : les tuteurs ne le voient plus.', {
        position: 'bottom-left',
      });
      onChanged();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Le statut n’a pas pu être enregistré', { position: 'bottom-left' });
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(tutorialLink(tutorial.slug));
      toast.success('Lien copié : à envoyer aux tuteurs', {
        position: 'bottom-left',
      });
    } catch {
      toast.error(`Copie impossible. Lien : ${tutorialLink(tutorial.slug)}`, {
        position: 'bottom-left',
        duration: 8000,
      });
    }
  };

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        flexWrap="wrap"
        useFlexGap>
        <OndemandVideoIcon color="primary" />
        <Typography sx={{ flex: 1, minWidth: 240 }} component="div">
          <b>{tutorial.title}</b>
          <Typography variant="body2" color="text.secondary">
            {tutorial.has_file
              ? `Vidéo envoyée le ${new Date(tutorial.uploaded_at).toLocaleDateString('fr-FR')} · ${mb(tutorial.size)}`
              : 'Pas encore de vidéo : le tutoriel n’est pas proposé aux tuteurs.'}
            {tutorial.has_file &&
              (tutorial.published ? ' · proposé aux tuteurs' : ' · non proposé aux tuteurs')}
          </Typography>
          {canEdit && tutorial.has_file && (
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={!!tutorial.published}
                  onChange={(e) => publish(e.target.checked)}
                />
              }
              label="Proposer aux tuteurs"
            />
          )}
        </Typography>
        {tutorial.published && (
          <>
            <Button
              size="small"
              startIcon={<PlayArrowIcon />}
              href={tutorialPath(tutorial.slug)}
              target="_blank"
              rel="noopener">
              Voir
            </Button>
            <Button size="small" startIcon={<ContentCopyIcon />} onClick={copy}>
              Copier le lien
            </Button>
          </>
        )}
        {canEdit && (
          <>
            <input
              ref={input}
              type="file"
              hidden
              accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm"
              onChange={send}
            />
            <Button
              size="small"
              variant="outlined"
              disabled={progress !== null}
              startIcon={<UploadFileIcon />}
              onClick={() => input.current.click()}>
              {tutorial.has_file ? 'Remplacer la vidéo' : 'Choisir la vidéo'}
            </Button>
            {tutorial.has_file && (
              <Button
                size="small"
                color="error"
                disabled={progress !== null}
                startIcon={<DeleteIcon />}
                onClick={() => setRemoving(true)}>
                Supprimer
              </Button>
            )}
          </>
        )}
      </Stack>
      {progress !== null && (
        <Box sx={{ mt: 1.5 }}>
          <LinearProgress
            variant={progress >= 100 ? 'indeterminate' : 'determinate'}
            value={progress}
          />
          <Typography variant="caption" color="text.secondary">
            {progress >= 100
              ? 'Enregistrement…'
              : `Envoi de la vidéo : ${progress} %. Gardez la page ouverte.`}
          </Typography>
        </Box>
      )}
      <Dialog open={removing} onClose={() => setRemoving(false)}>
        <DialogTitle>Supprimer la vidéo ?</DialogTitle>
        <DialogContent>
          <Typography>
            Le tutoriel n'est plus proposé aux tuteurs et le lien déjà envoyé
            affiche « pas encore disponible ». Vous pourrez envoyer une nouvelle
            vidéo.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoving(false)}>Garder</Button>
          <Button color="error" onClick={remove}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// "Documents" page: the video tutorials of the tutors (catalogue on the
// server). The managers send the video; the link works without signing in.
const TutorialsAdmin = ({ canEdit }) => {
  const [list, setList] = useState(null);
  const reload = useCallback(() => loadTutorials(true).then(setList), []);
  useEffect(() => {
    reload();
  }, [reload]);
  if (!list?.length) return null;
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
        Tutoriels vidéo pour les tuteurs
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        component="div"
        sx={{ mb: 1.5 }}>
        Vidéo au format téléphone (MP4, {MAX_MB} Mo au maximum). Une fois
        envoyée, elle apparaît dans « Mes élèves » des tuteurs ; le lien se
        copie ici pour l'envoyer par message.
      </Typography>
      <Stack spacing={2}>
        {list.map((t) => (
          <TutorialRow
            key={t.slug}
            tutorial={t}
            canEdit={canEdit}
            onChanged={reload}
          />
        ))}
      </Stack>
    </Paper>
  );
};

export default TutorialsAdmin;
