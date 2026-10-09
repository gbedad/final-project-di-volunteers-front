import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Chip,
  FormControlLabel,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { useSessionState } from '../../js/useSessionState';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const Section = ({ title, subtitle, children }) => (
  <Paper sx={{ p: 2, mb: 3 }}>
    <Typography variant="h6">{title}</Typography>
    {subtitle && (
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {subtitle}
      </Typography>
    )}
    {children}
  </Paper>
);

const Kpi = ({ label, value, detail }) => (
  <Paper sx={{ p: 2, height: '100%' }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="h4" color="primary">
      {value ?? '—'}
    </Typography>
    {detail && (
      <Typography variant="body2" color="text.secondary">
        {detail}
      </Typography>
    )}
  </Paper>
);

const Bars = ({ items, max }) => {
  const top = max || Math.max(1, ...items.map((i) => i.count));
  return items.map((i) => (
    <Box
      key={i.label}
      sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
      <Typography variant="body2" sx={{ width: 220, flexShrink: 0 }} noWrap>
        {i.label}
      </Typography>
      <Box
        sx={{ flex: 1, bgcolor: 'action.hover', borderRadius: 1, height: 18 }}>
        <Box
          sx={{
            width: `${(i.count / top) * 100}%`,
            minWidth: i.count ? 4 : 0,
            bgcolor: 'primary.main',
            height: '100%',
            borderRadius: 1,
          }}
        />
      </Box>
      <Typography variant="body2" sx={{ width: 40, textAlign: 'right' }}>
        {i.count}
      </Typography>
    </Box>
  ));
};

// Red: nobody to teach it, orange: fewer tutors than students, green: covered
const gapColor = ({ students, tutors }) =>
  !students
    ? 'transparent'
    : tutors === 0
      ? 'rgba(211, 47, 47, 0.75)'
      : tutors < students
        ? 'rgba(237, 108, 2, 0.6)'
        : 'rgba(46, 125, 50, 0.45)';

const formatMonth = (month) => {
  const [y, m] = month.split('-');
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('fr-FR', {
    month: 'short',
  });
};

// Students part of the "Analyse" page
const StudentAnalysis = () => {
  const navigate = useNavigate();
  const [includeDemo, setIncludeDemo] = useSessionState('analysis.demo', true);
  const [data, setData] = useState(null);

  useEffect(() => {
    setData(null);
    axios
      .get(`${BASE_URL}/admin/analytics/students`, {
        params: { demo: includeDemo ? 1 : 0 },
      })
      .then(({ data }) => setData(data))
      .catch(() => setData(false));
  }, [includeDemo]);

  // Waiting students needing this subject at this level
  const openStudents = (subject, level) => {
    const keys = {
      'students.subject': subject,
      'students.level': level,
      'students.day': null,
      'students.status': 'En attente de tuteur',
      'students.demo': includeDemo,
    };
    try {
      Object.entries(keys).forEach(([k, v]) =>
        sessionStorage.setItem(k, JSON.stringify(v))
      );
    } catch {}
    navigate('/eleves');
  };

  // Students of the list filtered on their parental consent
  const openConsent = (value) => {
    const keys = {
      'students.subject': null,
      'students.level': null,
      'students.day': null,
      'students.status': null,
      'students.consent': value,
      'students.demo': includeDemo,
    };
    try {
      Object.entries(keys).forEach(([k, v]) =>
        sessionStorage.setItem(k, JSON.stringify(v))
      );
    } catch {}
    navigate('/eleves');
  };

  if (data === false) {
    return (
      <Alert severity="error">
        L'analyse des élèves n'a pas pu être chargée.
      </Alert>
    );
  }
  if (!data) return <LinearProgress />;
  const { requests, gap, pairs, profile, consent } = data;
  const maxHours = Math.max(1, ...pairs.hoursByMonth.map((m) => m.hours));

  return (
    <>
      <FormControlLabel
        sx={{ mb: 1 }}
        control={
          <Switch
            checked={includeDemo}
            onChange={(e) => setIncludeDemo(e.target.checked)}
          />
        }
        label={`Inclure les élèves de démonstration${
          requests.demo ? ` (${requests.demo})` : ''
        }`}
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Kpi label="Élèves" value={requests.total} />
        </Grid>
        <Grid item xs={6} md={3}>
          <Kpi
            label="En attente d'un tuteur"
            value={requests.waiting}
            detail={
              requests.waitingDays !== null
                ? `depuis ${requests.waitingDays} jours en moyenne`
                : null
            }
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <Kpi
            label="Délai moyen avant un tuteur"
            value={
              requests.daysToTutor !== null ? `${requests.daysToTutor} j` : '—'
            }
            detail="de la demande à l'accord du tuteur"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <Kpi
            label="Binômes actifs"
            value={pairs.active}
            detail={`${String(pairs.hours).replace('.', ',')} h de tutorat réalisées`}
          />
        </Grid>
      </Grid>

      {consent && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack direction="row" flexWrap="wrap" alignItems="center" gap={1}>
            <Typography fontWeight={600} sx={{ mr: 1 }}>
              Accord des parents
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              demandes en cours, cliquez pour voir les élèves :
            </Typography>
            <Chip
              color="success"
              variant="outlined"
              label={`${consent.signed} signé${consent.signed > 1 ? 's' : ''}`}
              onClick={() => openConsent('signed')}
            />
            <Chip
              color="warning"
              variant="outlined"
              label={`${consent.pending} en attente`}
              onClick={() => openConsent('pending')}
            />
            <Chip
              color="error"
              variant="outlined"
              label={`${consent.missing} manquant${consent.missing > 1 ? 's' : ''}`}
              onClick={() => openConsent('missing')}
            />
            {consent.pairsWithout > 0 && (
              <Chip
                color="error"
                label={`${consent.pairsWithout} binôme${consent.pairsWithout > 1 ? 's' : ''} sans accord`}
                onClick={() => openConsent('urgent')}
              />
            )}
          </Stack>
        </Paper>
      )}

      <Section
        title="Demande et offre"
        subtitle="Élèves en attente / tuteurs actifs, par matière et niveau. Rouge : aucun tuteur, orange : moins de tuteurs que d'élèves, vert : couvert. Cliquez sur une case pour voir ces élèves.">
        {gap.subjects.length === 0 ? (
          <Alert severity="success">Aucun élève en attente.</Alert>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ width: 'auto' }}>
              <TableHead>
                <TableRow>
                  <TableCell />
                  {gap.levels.map((l) => (
                    <TableCell key={l} align="center" sx={{ p: 0.5 }}>
                      {l}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {gap.subjects.map((subject) => (
                  <TableRow key={subject}>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {subject}
                    </TableCell>
                    {gap.levels.map((level) => {
                      const cell = gap.cells[subject][level];
                      return (
                        <TableCell
                          key={level}
                          align="center"
                          onClick={
                            cell.students
                              ? () => openStudents(subject, level)
                              : undefined
                          }
                          sx={{
                            p: 0.5,
                            minWidth: 52,
                            bgcolor: gapColor(cell),
                            color:
                              cell.students && !cell.tutors
                                ? 'common.white'
                                : 'text.primary',
                            cursor: cell.students ? 'pointer' : 'default',
                            border: '1px solid',
                            borderColor: 'divider',
                          }}>
                          {cell.students ? (
                            <Tooltip
                              title={`${cell.students} élève(s) en attente, ${cell.tutors} tuteur(s) actif(s)`}>
                              <span>
                                {cell.students} / {cell.tutors}
                              </span>
                            </Tooltip>
                          ) : (
                            ''
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Section>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Section title="Demandes par statut">
            <Bars items={requests.byStatus} />
            {requests.byPriority.length > 0 && (
              <>
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                  Élèves en attente, par priorité
                </Typography>
                <Bars
                  items={requests.byPriority.map((p) => ({
                    ...p,
                    label:
                      {
                        TOP: 'Urgente',
                        P1: 'Haute',
                        P2: 'Normale',
                        P3: 'Basse',
                      }[p.label] || p.label,
                  }))}
                />
              </>
            )}
          </Section>
        </Grid>
        <Grid item xs={12} md={6}>
          <Section title="Tutorat réalisé">
            <Typography variant="body2" sx={{ mb: 1 }}>
              {pairs.sessions} compte(s)-rendu(s) · assiduité{' '}
              <b>{pairs.attendance !== null ? `${pairs.attendance} %` : '—'}</b>{' '}
              · ressenti moyen{' '}
              <b>
                {pairs.progress !== null
                  ? `${String(pairs.progress).replace('.', ',')} / 5`
                  : '—'}
              </b>
            </Typography>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Heures de tutorat par mois
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 0.5,
                height: 120,
              }}>
              {pairs.hoursByMonth.map((m) => (
                <Tooltip
                  key={m.month}
                  title={`${formatMonth(m.month)} : ${m.hours} h`}>
                  <Box sx={{ flex: 1, textAlign: 'center' }}>
                    <Box
                      sx={{
                        height: `${(m.hours / maxHours) * 90}px`,
                        minHeight: m.hours ? 2 : 0,
                        bgcolor: 'primary.main',
                        borderRadius: '2px 2px 0 0',
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {formatMonth(m.month)}
                    </Typography>
                  </Box>
                </Tooltip>
              ))}
            </Box>
            {pairs.endReasons.length + pairs.declineReasons.length > 0 && (
              <>
                <Typography variant="subtitle2" sx={{ mt: 2 }}>
                  Motifs de fin et de refus
                </Typography>
                {[
                  ...pairs.endReasons.map((r) => `Fin : ${r}`),
                  ...pairs.declineReasons.map((r) => `Refus : ${r}`),
                ].map((r, i) => (
                  <Typography key={i} variant="body2" color="text.secondary">
                    · {r}
                  </Typography>
                ))}
              </>
            )}
          </Section>
        </Grid>
        <Grid item xs={12} md={6}>
          <Section title="Niveaux">
            <Bars items={profile.byLevel} />
          </Section>
          <Section title="Origine des demandes">
            <Bars items={profile.byReferral} />
          </Section>
        </Grid>
        <Grid item xs={12} md={6}>
          <Section title="Éducation prioritaire">
            <Bars items={profile.byRep} />
          </Section>
          <Section title="Établissements (10 premiers)">
            <Bars items={profile.bySchool} />
          </Section>
        </Grid>
      </Grid>
    </>
  );
};

export default StudentAnalysis;
