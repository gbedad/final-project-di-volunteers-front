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
  return (
    <Stack spacing={1}>
      {available.map((t) => (
        <Paper
          key={t.slug}
          variant="outlined"
          sx={{ p: 1.5, bgcolor: 'action.hover' }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <PlayCircleOutlineIcon color="primary" fontSize="large" />
            <Stack sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600}>
                Tutoriel vidéo : {t.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t.minutes ? `Environ ${t.minutes} minute` : 'Vidéo'}
                {t.minutes > 1 ? 's' : ''}
              </Typography>
            </Stack>
            <Button
              size="small"
              variant="contained"
              component={RouterLink}
              to={tutorialPath(t.slug)}
              state={location.state}>
              Voir
            </Button>
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
};

export default TutorialCard;
