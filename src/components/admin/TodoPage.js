import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  LinearProgress,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PageHeader from './PageHeader';

const BASE_URL = process.env.REACT_APP_BASE_URL;
// Colour of the count by urgency
const COLORS = { error: 'error.main', warning: 'warning.dark', info: 'primary.main' };

// "À traiter": what waits for the team, each with where to act
const TodoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [blocks, setBlocks] = useState(null);
  const [error, setError] = useState(false);
  const userLogged = location.state?.userLogged || (() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  })();

  const load = useCallback(() => {
    setError(false);
    axios
      .get(`${BASE_URL}/admin/todo`)
      .then(({ data }) => setBlocks(data))
      .catch(() => setError(true));
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const go = (link) => {
    if (!link) return;
    if (link.userId) {
      navigate('/change-status', { state: { userId: link.userId, userLogged } });
    } else {
      navigate(link.path, { state: { userLogged, open: link.open } });
    }
  };

  const todo = (blocks || []).filter((b) => b.count > 0);
  const done = (blocks || []).filter((b) => b.count === 0);
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <PageHeader
        title="À traiter"
        subtitle="Ce qui attend une action de l'équipe. Touchez une ligne pour y aller."
        actions={
          <Button size="small" onClick={load}>
            Actualiser
          </Button>
        }
      />
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          La liste n'a pas pu être chargée. Réessayez avec « Actualiser ».
        </Alert>
      )}
      {!blocks && !error && <LinearProgress />}
      {blocks && todo.length === 0 && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Rien à traiter pour le moment.
        </Alert>
      )}
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          alignItems: 'start',
        }}>
        {todo.map((b) => (
          <Paper key={b.key} variant="outlined" sx={{ p: 2, minWidth: 0 }}>
            <Stack direction="row" spacing={1.5} alignItems="baseline">
              <Typography
                variant="h4"
                component="span"
                sx={{ color: COLORS[b.severity], fontVariantNumeric: 'tabular-nums' }}>
                {b.count}
              </Typography>
              <Typography variant="h6" component="h2" sx={{ lineHeight: 1.2 }}>
                {b.label}
              </Typography>
            </Stack>
            {b.hint && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {b.hint}
              </Typography>
            )}
            <List dense disablePadding sx={{ mt: 1 }}>
              {b.items.map((i) => (
                <ListItemButton
                  key={i.id}
                  onClick={() => go(i.link || b.link)}
                  sx={{ borderRadius: 1, px: 1 }}>
                  <ListItemText
                    primary={i.label}
                    secondary={i.detail}
                    primaryTypographyProps={{ noWrap: true }}
                    secondaryTypographyProps={{ noWrap: true }}
                  />
                </ListItemButton>
              ))}
            </List>
            <Button size="small" sx={{ mt: 0.5 }} onClick={() => go(b.link)}>
              {b.count > b.items.length ? `Voir les ${b.count}` : 'Y aller'}
            </Button>
          </Paper>
        ))}
      </Box>
      {done.length > 0 && (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
          sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            À jour :
          </Typography>
          {done.map((b) => (
            <Chip
              key={b.key}
              size="small"
              variant="outlined"
              color="success"
              icon={<CheckCircleIcon />}
              label={b.label}
            />
          ))}
        </Stack>
      )}
    </Container>
  );
};

export default TodoPage;
