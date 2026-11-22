import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Container,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { tutorialLink, tutorialPath } from '../js/tutorials';
import { useAuth } from '../AuthContext';

const BASE_URL = process.env.REACT_APP_BASE_URL;

// After the video: back to the students of a tutor who is signed in (the
// tutorial is open to everyone; the link to the list is always there)
const WhereNext = () => {
  const { isLoggedIn } = useAuth() || {};
  return (
    <Stack spacing={1} sx={{ mt: 1 }}>
      {isLoggedIn && (
        <Button
          variant="contained"
          size="large"
          fullWidth
          component={RouterLink}
          to="/login?onglet=eleves">
          Retour à mes élèves
        </Button>
      )}
      <Button variant="outlined" fullWidth component={RouterLink} to="/tutoriel">
        Tous les tutoriels
      </Button>
    </Stack>
  );
};

// One tutorial: the video, made for a phone, with a link to share
const Tutorial = ({ slug }) => {
  const [tutorial, setTutorial] = useState(undefined);
  useEffect(() => {
    setTutorial(undefined);
    axios
      .get(`${BASE_URL}/tutorials/${slug}`)
      .then(({ data }) => setTutorial(data))
      .catch(() => setTutorial(null));
  }, [slug]);

  if (tutorial === undefined) return <LinearProgress />;
  if (tutorial === null) {
    return <Alert severity="warning">Ce tutoriel n'existe pas.</Alert>;
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(tutorialLink(slug));
      toast.success('Lien copié', { position: 'bottom-left' });
    } catch {
      toast.error('Copie impossible : copiez l’adresse de la page', {
        position: 'bottom-left',
      });
    }
  };
  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="overline" color="text.secondary">
          Tutoriel pour les tuteurs bénévoles
        </Typography>
        <Typography variant="h5" component="h1">
          {tutorial.title}
        </Typography>
        {tutorial.description && (
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {tutorial.description}
          </Typography>
        )}
      </Box>
      {tutorial.has_video ? (
        <>
          {/* Plays in the page on a phone (no download, no full screen forced) */}
          <Box
            component="video"
            controls
            playsInline
            preload="metadata"
            src={`${tutorial.url}#t=0.1`}
            sx={{
              width: '100%',
              maxHeight: '78vh',
              bgcolor: '#000',
              borderRadius: 2,
              display: 'block',
            }}
          />
          <WhereNext />
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button size="small" startIcon={<ContentCopyIcon />} onClick={copy}>
              Copier le lien
            </Button>
          </Stack>
        </>
      ) : (
        <Alert severity="info">
          La vidéo n'est pas encore disponible. Revenez bientôt, ou contactez
          l'association.
        </Alert>
      )}
    </Stack>
  );
};

// /tutoriel: the only tutorial (or the list when there are several);
// /tutoriel/:slug: this one. Open to everyone: the link is sent by message.
const TutorialPage = () => {
  const { slug } = useParams();
  const [list, setList] = useState(undefined);
  useEffect(() => {
    if (slug) return;
    axios
      .get(`${BASE_URL}/tutorials`)
      .then(({ data }) => setList(data.filter((t) => t.has_video)))
      .catch(() => setList([]));
  }, [slug]);

  return (
    <Container maxWidth="sm" sx={{ mt: 3, mb: 5 }}>
      {slug ? (
        <Tutorial slug={slug} />
      ) : list === undefined ? (
        <LinearProgress />
      ) : list.length === 1 ? (
        <Tutorial slug={list[0].slug} />
      ) : list.length === 0 ? (
        <Alert severity="info">Aucun tutoriel pour l'instant.</Alert>
      ) : (
        <Stack spacing={2}>
          <WhereNext />
          <Typography variant="h5" component="h1">
            Tutoriels
          </Typography>
          {list.map((t) => (
            <Paper
              key={t.slug}
              variant="outlined"
              component={RouterLink}
              to={tutorialPath(t.slug)}
              sx={{ p: 2, textDecoration: 'none', color: 'inherit' }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <PlayCircleOutlineIcon color="primary" fontSize="large" />
                <Box>
                  <Typography fontWeight={600}>{t.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t.description}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Container>
  );
};

export default TutorialPage;
