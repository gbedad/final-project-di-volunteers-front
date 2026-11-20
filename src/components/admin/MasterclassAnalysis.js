import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Alert,
  LinearProgress,
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
  MasterclassFigures,
  fr,
  masterclassSummary,
  masterclassUnavailable,
  years,
} from './reportParts';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const shortDate = (d) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

// "Master Classes" view of the analysis: figures read from the MCL application
const MasterclassAnalysis = () => {
  const [year, setYear] = useSessionState('analysis.mclYear', years()[0]);
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    setData(null);
    setError(false);
    axios
      .get(`${BASE_URL}/admin/analytics/masterclasses`, { params: { year } })
      .then(({ data }) => setData(data))
      .catch(() => setError(true));
  }, [year]);

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
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
          Chiffres anonymes lus dans l'application des Master Classes (éditions de test exclues).
        </Typography>
      </Stack>
      {error && <Alert severity="error">L'analyse n'a pas pu être chargée.</Alert>}
      {!data && !error && <LinearProgress />}
      {data && data.status !== 'ok' && (
        <Alert severity="warning">{masterclassUnavailable(data)}</Alert>
      )}
      {data?.status === 'ok' && (
        <>
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <MasterclassFigures m={data} />
          </Paper>
          <Alert severity="info" icon={false}>
            {masterclassSummary(data)}
          </Alert>
          {data.editions.length > 0 && (
            <Paper variant="outlined" sx={{ p: 2.5, overflowX: 'auto' }}>
              <Typography variant="h6" component="h2" sx={{ mb: 1.5 }}>
                Éditions
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Master Class</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Élèves accueillies</TableCell>
                    <TableCell align="right">Présentes</TableCell>
                    <TableCell align="right">Établissements</TableCell>
                    <TableCell align="right">Ateliers</TableCell>
                    <TableCell align="right">Satisfaction</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.editions.map((e) => (
                    <TableRow key={e.slug}>
                      <TableCell>{e.titre}</TableCell>
                      <TableCell>
                        {shortDate(e.date)}
                        {!e.terminee && ' (à venir)'}
                      </TableCell>
                      <TableCell align="right">{e.eleves.retenues}</TableCell>
                      <TableCell align="right">{e.eleves.presentes}</TableCell>
                      <TableCell align="right">{e.etablissements}</TableCell>
                      <TableCell align="right">{e.ateliers}</TableCell>
                      <TableCell align="right">
                        {e.satisfaction.note_moyenne === null
                          ? '—'
                          : `${fr(e.satisfaction.note_moyenne)} / 5 (${e.satisfaction.reponses})`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          )}
        </>
      )}
    </Stack>
  );
};

export default MasterclassAnalysis;
