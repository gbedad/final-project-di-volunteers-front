import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Button, Paper, Stack, Typography } from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { tutorialPath, useTutorials } from '../../js/tutorials';

// Video tutorials for the tutors (the ones the team has sent), at the top
// of "Mes élèves"
const TutorialCard = () => {
  const tutorials = useTutorials();
  const location = useLocation();
  const available = (tutorials || []).filter(
    (t) => t.has_video && t.audience === 'tuteurs'
  );
  if (!available.length) return null;
  // One tutorial: straight to its video. Several: one entry to the list
  const one = available.length === 1 ? available[0] : null;
  return (
    <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'action.hover' }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <PlayCircleOutlineIcon color="primary" fontSize="large" />
        <Stack sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600}>
            {one ? `Tutoriel vidéo : ${one.title}` : 'Tutoriels vidéo'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {one
              ? one.minutes
                ? `Environ ${one.minutes} minute${one.minutes > 1 ? 's' : ''}`
                : 'Vidéo'
              : `${available.length} vidéos courtes pour vous aider`}
          </Typography>
        </Stack>
        <Button
          size="small"
          variant="contained"
          component={RouterLink}
          to={one ? tutorialPath(one.slug) : '/tutoriel'}
          state={location.state}>
          {one ? 'Voir' : 'Ouvrir'}
        </Button>
      </Stack>
    </Paper>
  );
};

export default TutorialCard;
