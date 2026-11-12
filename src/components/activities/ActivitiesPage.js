import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy';
import PageHeader from '../admin/PageHeader';
import { RefundsList } from './Expenses';
import { isCulture, isManager } from '../../js/roles';
import {
  ACTIVITY_STATUSES,
  BASE_URL,
  euros,
  frDate,
  hours,
  today,
} from './activityUtils';

const userOf = (location) => {
  if (location.state?.userLogged) return location.state.userLogged;
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};

const ActivityCard = ({ a, onOpen }) => {
  const st = ACTIVITY_STATUSES[a.shown_status] || ACTIVITY_STATUSES.brouillon;
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardActionArea
        onClick={onOpen}
        sx={{
          height: '100%',
          alignItems: 'stretch',
          display: 'flex',
          flexDirection: 'column',
        }}>
        {a.image ? (
          <CardMedia
            component="img"
            image={a.image}
            alt=""
            sx={{ height: 150, objectFit: 'cover' }}
          />
        ) : (
          <Box
            sx={{
              height: 150,
              bgcolor: 'action.hover',
              display: 'grid',
              placeItems: 'center',
              width: '100%',
            }}>
            <TheaterComedyIcon sx={{ fontSize: 56, color: 'text.disabled' }} />
          </Box>
        )}
        <CardContent sx={{ width: '100%', flex: 1 }}>
          <Stack
            direction="row"
            spacing={0.5}
            flexWrap="wrap"
            useFlexGap
            sx={{ mb: 1 }}>
            <Chip size="small" color={st.color} label={st.label} />
            {a.kind && <Chip size="small" variant="outlined" label={a.kind} />}
            {a.program && (
              <Chip
                size="small"
                variant="outlined"
                color="secondary"
                label={a.program}
              />
            )}
          </Stack>
          <Typography
            variant="h6"
            component="h2"
            sx={{ lineHeight: 1.25, mb: 0.5 }}>
            {a.title}
          </Typography>
          <Typography
            variant="body2"
            sx={{ '&::first-letter': { textTransform: 'uppercase' } }}>
            {frDate(a.date)}
            {hours(a) ? ` · ${hours(a)}` : ''}
          </Typography>
          {a.place && (
            <Typography variant="body2" color="text.secondary" noWrap>
              {a.place}
            </Typography>
          )}
          <Stack direction="row" spacing={2} sx={{ mt: 1.5 }}>
            <Typography variant="body2">
              <b>{a.registered}</b>
              {a.places ? ` / ${a.places}` : ''} inscrit
              {a.registered > 1 ? 's' : ''}
              {a.waiting ? ` · ${a.waiting} en attente` : ''}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Number(a.fee) > 0 ? euros(a.fee) : 'Gratuit'}
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

// Cultural activities (outings): one card each, apart from the tutoring
const ActivitiesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userLogged = userOf(location);
  const manager = isCulture(userLogged?.user?.role);
  const [items, setItems] = useState(null);
  const [error, setError] = useState(false);
  // From À traiter: the refunds
  const [view, setView] = useState(
    location.state?.open === 'remboursements' ? 'remboursements' : 'avenir'
  );
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');

  useEffect(() => {
    axios
      .get(`${BASE_URL}/admin/activites`)
      .then(({ data }) => setItems(data))
      .catch(() => setError(true));
  }, []);

  const shown = useMemo(() => {
    const all = items || [];
    if (view === 'passees') {
      return all.filter((a) => a.date && a.date < today()).reverse();
    }
    return all.filter((a) => !a.date || a.date >= today());
  }, [items, view]);

  const open = (id) => navigate(`/activites/${id}`, { state: { userLogged } });
  const create = async () => {
    try {
      const { data } = await axios.post(`${BASE_URL}/admin/activites`, {
        title,
      });
      open(data.id);
    } catch (err) {
      toast.error(
        err.response?.data?.error || "L'activité n'a pas pu être créée",
        {
          position: 'bottom-left',
        }
      );
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <PageHeader
        title="Activités culturelles"
        subtitle="Les sorties de l'association : inscriptions des élèves, accompagnateurs et budget."
        actions={
          manager && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreating(true)}>
              Nouvelle activité
            </Button>
          )
        }
      />
      <ToggleButtonGroup
        size="small"
        exclusive
        value={view}
        onChange={(e, v) => v && setView(v)}
        sx={{ mb: 2 }}>
        <ToggleButton value="avenir">À venir</ToggleButton>
        <ToggleButton value="passees">Passées</ToggleButton>
        <ToggleButton value="remboursements">À rembourser</ToggleButton>
      </ToggleButtonGroup>
      {error && (
        <Alert severity="error">La liste n'a pas pu être chargée.</Alert>
      )}
      {!items && !error && <LinearProgress />}
      {view === 'remboursements' && (
        <RefundsList manager={isManager(userLogged?.user?.role)} />
      )}
      {view !== 'remboursements' && items && !shown.length && (
        <Alert severity="info">
          {view === 'avenir'
            ? 'Aucune activité à venir.'
            : 'Aucune activité passée.'}
        </Alert>
      )}
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(3, minmax(0, 1fr))',
          },
        }}>
        {view !== 'remboursements' &&
          shown.map((a) => (
            <ActivityCard key={a.id} a={a} onOpen={() => open(a.id)} />
          ))}
      </Box>
      <Dialog
        open={creating}
        onClose={() => setCreating(false)}
        fullWidth
        maxWidth="xs">
        <DialogTitle>Nouvelle activité</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label="Titre"
            placeholder="Ex. : Musée d'Orsay, les impressionnistes"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mt: 1 }}
          />
          <Typography variant="caption" color="text.secondary">
            Elle est créée en brouillon : vous complétez ensuite la date, le
            lieu, les places et le budget.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreating(false)}>Annuler</Button>
          <Button variant="contained" disabled={!title.trim()} onClick={create}>
            Créer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ActivitiesPage;
