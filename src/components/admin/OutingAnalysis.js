import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Chip,
  LinearProgress,
  Link,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useSessionState } from '../../js/useSessionState';
import {
  Bars,
  OutingFigures,
  Section,
  monthLabel,
  outingSummary,
  years,
} from './reportParts';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const STATUS_COLOR = {
  réalisée: 'success',
  'à venir': 'info',
  annulée: 'default',
};
const shortDate = (d) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });

// "Sorties" view of the analysis: the cultural outings of a school year
const OutingAnalysis = () => {
  const navigate = useNavigate();
  const [year, setYear] = useSessionState('analysis.outingsYear', years()[0]);
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    setData(null);
    setError(false);
    axios
      .get(`${BASE_URL}/admin/analytics/outings`, { params: { year } })
      .then(({ data }) => setData(data))
      .catch(() => setError(true));
  }, [year]);

  const open = (id) => {
    let userLogged = null;
    try {
      userLogged = JSON.parse(localStorage.getItem('user'));
    } catch {}
    navigate(`/activites/${id}`, { state: { userLogged } });
  };

  return (
    <Stack spacing={2.5}>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        flexWrap="wrap"
        useFlexGap>
        <TextField
          select
          size="small"
          label="Année scolaire"
          value={year}
          onChange={(e) => setYear(e.target.value)}>
          {years().map((y) => (
            <MenuItem key={y} value={y}>
              {y}
            </MenuItem>
          ))}
        </TextField>
        <Typography variant="body2" color="text.secondary">
          Sorties publiées (brouillons exclus), enfants de démonstration exclus.
        </Typography>
      </Stack>
      {error && (
        <Alert severity="error">
          L'analyse des sorties n'a pas pu être calculée.
        </Alert>
      )}
      {!data && !error && <LinearProgress />}
      {data && (
        <>
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <OutingFigures o={data} />
          </Paper>
          <Alert severity="info" icon={false}>
            {outingSummary(data)}
          </Alert>
          <Box
            sx={{
              display: 'grid',
              gap: 2.5,
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              alignItems: 'start',
            }}>
            <Section title="Enfants par cycle">
              <Bars rows={data.cycles} total={data.figures.children} />
            </Section>
            <Section
              title="Établissements des enfants"
              note="Éducation prioritaire selon l'annuaire officiel de l'Éducation nationale.">
              <Bars rows={data.priority} total={data.figures.children} />
            </Section>
            <Section title="Types de sortie">
              <Bars rows={data.kinds} />
            </Section>
            <Section title="Sorties réalisées par mois">
              <Bars
                rows={data.months.map((m) => ({
                  label: monthLabel(m.month),
                  count: m.count,
                }))}
              />
            </Section>
          </Box>
          <Section title="Toutes les sorties de l'année">
            {data.outings.length === 0 ? (
              <Typography color="text.secondary">Aucune sortie.</Typography>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Sortie</TableCell>
                      <TableCell>État</TableCell>
                      <TableCell align="right">Inscrits</TableCell>
                      <TableCell align="right">Présents</TableCell>
                      <TableCell align="right">Adultes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.outings.map((o) => (
                      <TableRow key={o.id} hover>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {shortDate(o.date)}
                        </TableCell>
                        <TableCell>
                          <Link component="button" onClick={() => open(o.id)}>
                            {o.title}
                          </Link>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block">
                            {o.kind}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            color={STATUS_COLOR[o.status]}
                            variant="outlined"
                            label={o.status}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {o.registered}
                          {o.places ? ` / ${o.places}` : ''}
                        </TableCell>
                        <TableCell align="right">
                          {o.marked ? o.present : '—'}
                        </TableCell>
                        <TableCell align="right">{o.adults}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </Section>
        </>
      )}
    </Stack>
  );
};

export default OutingAnalysis;
