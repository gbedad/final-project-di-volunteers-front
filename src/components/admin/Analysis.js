import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Container,
  Grid,
  LinearProgress,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import PageHeader from './PageHeader';
import StudentAnalysis from './StudentAnalysis';
import { useSessionState } from '../../js/useSessionState';

import { ACTIVE_TUTORS } from '../../js/volunteerSearch';

const BASE_URL = process.env.REACT_APP_BASE_URL;
// Primary colour of the theme, used with a variable opacity in the grids
const HEAT_RGB = '0, 105, 92';

// Status filter of the dashboard matching each scope
const SCOPE_STATUS = { active: ACTIVE_TUTORS, validated: 'Validé', all: null };

const SCOPES = [
  { value: 'active', label: 'Tuteurs actifs' },
  { value: 'validated', label: 'Tous les validés' },
  { value: 'all', label: 'Tous les bénévoles' },
];

const session = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};

const percent = (n, total) => (total ? Math.round((n / total) * 100) : 0);

const formatMonth = (month) => {
  const [y, m] = month.split('-');
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('fr-FR', {
    month: 'short',
    year: '2-digit',
  });
};

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
      {value}
    </Typography>
    {detail && (
      <Typography variant="body2" color="text.secondary">
        {detail}
      </Typography>
    )}
  </Paper>
);

// Horizontal bar with its value, for lists of counts
const Bar = ({ label, value, max, detail }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
    <Typography variant="body2" sx={{ width: 220, flexShrink: 0 }} noWrap>
      {label}
    </Typography>
    <Box sx={{ flex: 1, bgcolor: 'action.hover', borderRadius: 1, height: 18 }}>
      <Box
        sx={{
          width: `${max ? (value / max) * 100 : 0}%`,
          minWidth: value ? 4 : 0,
          bgcolor: 'primary.main',
          height: '100%',
          borderRadius: 1,
        }}
      />
    </Box>
    <Typography variant="body2" sx={{ width: 110, textAlign: 'right' }}>
      {value}
      {detail ? ` (${detail})` : ''}
    </Typography>
  </Box>
);

// Count in a coloured cell: the darker, the more tutors
const HeatCell = ({ value, max, title, onClick }) => {
  const alpha = value && max ? 0.15 + 0.85 * (value / max) : 0;
  return (
    <TableCell
      align="center"
      onClick={value ? onClick : undefined}
      sx={{
        p: 0.5,
        minWidth: 36,
        bgcolor: value ? `rgba(${HEAT_RGB}, ${alpha})` : 'transparent',
        color: alpha > 0.55 ? 'common.white' : 'text.primary',
        cursor: value ? 'pointer' : 'default',
        border: '1px solid',
        borderColor: 'divider',
      }}>
      {value ? (
        <Tooltip title={title}>
          <span>{value}</span>
        </Tooltip>
      ) : (
        ''
      )}
    </TableCell>
  );
};

const Duration = ({ label, value }) => (
  <Typography variant="body2">
    {label} :{' '}
    {value.count ? (
      <b>
        {value.days} jour{value.days > 1 ? 's' : ''}
      </b>
    ) : (
      <span>pas encore de données</span>
    )}
    {value.count
      ? ` (${value.count} candidat${value.count > 1 ? 's' : ''})`
      : ''}
  </Typography>
);

const Yes = ({ ok }) =>
  ok ? (
    <CheckIcon fontSize="small" color="success" />
  ) : (
    <CloseIcon fontSize="small" color="error" />
  );

const Analysis = () => {
  const navigate = useNavigate();
  const [scope, setScope] = useState('active');
  // Tutors (volunteers, recruitment) or students (requests, pairs)
  const [view, setView] = useSessionState('analysis.view', 'tutors');
  const viewToggle = (
    <ToggleButtonGroup
      size="small"
      exclusive
      color="primary"
      value={view}
      onChange={(e, value) => value && setView(value)}>
      <ToggleButton value="tutors">Tuteurs</ToggleButton>
      <ToggleButton value="students">Élèves</ToggleButton>
    </ToggleButtonGroup>
  );
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [showAll, setShowAll] = useState({ incomplete: false, stuck: false });
  const userLogged = session();

  const load = useCallback(async () => {
    setError(false);
    try {
      const { data } = await axios.get(`${BASE_URL}/admin/analytics`, {
        params: { scope },
      });
      setData(data);
    } catch (err) {
      console.error(err);
      setError(true);
    }
  }, [scope]);

  useEffect(() => {
    load();
  }, [load]);

  const openVolunteer = (id) =>
    navigate('/change-status', { state: { userId: id, userLogged } });

  // Opens the dashboard with its search fields set (they are kept in the
  // browser tab, see Users2)
  const openDashboard = (search) => {
    const keys = {
      'dashboard.q.subject': null,
      'dashboard.q.levelFrom': null,
      'dashboard.q.levelTo': null,
      'dashboard.q.days': [],
      'dashboard.q.timeFrom': null,
      'dashboard.q.timeTo': null,
      'dashboard.cohort': null,
      // Same tutors as the counted ones: the scope becomes the status filter
      'dashboard.status': SCOPE_STATUS[data.scope] ?? null,
      'dashboard.gridFilter': { items: [] },
      ...search,
    };
    try {
      Object.entries(keys).forEach(([k, v]) =>
        sessionStorage.setItem(k, JSON.stringify(v))
      );
      const page = JSON.parse(sessionStorage.getItem('dashboard.page'));
      if (page) {
        sessionStorage.setItem(
          'dashboard.page',
          JSON.stringify({ ...page, page: 0 })
        );
      }
    } catch {}
    navigate('/view-users', { state: { userLogged } });
  };

  if (view === 'students') {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <PageHeader
          title="Analyse"
          subtitle="Demandes des élèves, demande et offre de tutorat, binômes et séances."
          actions={viewToggle}
        />
        <StudentAnalysis />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">L'analyse n'a pas pu être chargée.</Alert>
      </Container>
    );
  }
  if (!data) return <LinearProgress sx={{ mt: 4 }} />;

  const { tutors, supply, recruitment } = data;
  const scopeLabel = SCOPES.find((s) => s.value === data.scope).label;
  const matrixMax = Math.max(
    0,
    ...Object.values(supply.matrix).flatMap((l) => Object.values(l))
  );
  const slotsMax = Math.max(
    0,
    ...Object.values(supply.slots).flatMap((h) => Object.values(h))
  );
  const monthMax = Math.max(1, ...recruitment.byMonth.map((m) => m.count));
  const registered = recruitment.funnel[0].count;
  const inProgress = recruitment.stuck.length;
  const incomplete = showAll.incomplete
    ? tutors.incomplete
    : tutors.incomplete.slice(0, 10);
  const stuck = showAll.stuck
    ? recruitment.stuck
    : recruitment.stuck.slice(0, 10);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <PageHeader
        title="Analyse"
        subtitle="Profils des tuteurs, offre de tutorat et recrutement."
        actions={
          <Stack direction="row" spacing={2} flexWrap="wrap">
            {viewToggle}
            <ToggleButtonGroup
              size="small"
              exclusive
              value={scope}
              onChange={(e, value) => value && setScope(value)}>
              {SCOPES.map((s) => (
                <ToggleButton key={s.value} value={s.value}>
                  {s.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Stack>
        }
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Kpi label={scopeLabel} value={tutors.total} />
        </Grid>
        <Grid item xs={6} md={3}>
          <Kpi
            label="Profils complets"
            value={`${percent(tutors.complete, tutors.total)} %`}
            detail={`${tutors.complete} sur ${tutors.total}`}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <Kpi
            label="Élèves pouvant être suivis"
            value={supply.capacity}
            detail={`d'après ${supply.withProfile} profil(s) renseigné(s)`}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <Kpi
            label="Candidatures sans activité"
            value={inProgress}
            detail={`depuis plus de ${recruitment.stuckDays} jours`}
          />
        </Grid>
      </Grid>

      <Section
        title="Profils des tuteurs"
        subtitle={`${scopeLabel} : informations renseignées dans « Mes souhaits et disponibilités ».`}>
        <Bar
          label="Matières et niveaux manquants"
          value={tutors.missing.topics}
          max={tutors.total}
          detail={`${percent(tutors.missing.topics, tutors.total)} %`}
        />
        <Bar
          label="Créneaux manquants"
          value={tutors.missing.slots}
          max={tutors.total}
          detail={`${percent(tutors.missing.slots, tutors.total)} %`}
        />
        <Bar
          label="Lieux manquants"
          value={tutors.missing.places}
          max={tutors.total}
          detail={`${percent(tutors.missing.places, tutors.total)} %`}
        />
        {tutors.incomplete.length > 0 && (
          <Box sx={{ overflowX: 'auto', mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Profil incomplet</TableCell>
                  <TableCell align="center">Matières</TableCell>
                  <TableCell align="center">Créneaux</TableCell>
                  <TableCell align="center">Lieux</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {incomplete.map((t) => (
                  <TableRow key={t.id} hover>
                    <TableCell>
                      <Link
                        component="button"
                        onClick={() => openVolunteer(t.id)}>
                        {t.name}
                      </Link>
                    </TableCell>
                    <TableCell align="center">
                      <Yes ok={t.topics} />
                    </TableCell>
                    <TableCell align="center">
                      <Yes ok={t.slots} />
                    </TableCell>
                    <TableCell align="center">
                      <Yes ok={t.places} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {tutors.incomplete.length > 10 && (
              <Button
                size="small"
                onClick={() =>
                  setShowAll((s) => ({ ...s, incomplete: !s.incomplete }))
                }>
                {showAll.incomplete
                  ? 'Réduire'
                  : `Voir les ${tutors.incomplete.length}`}
              </Button>
            )}
          </Box>
        )}
      </Section>

      <Section
        title="Offre de tutorat"
        subtitle={`${scopeLabel} ayant renseigné leur profil : ${supply.withProfile}. Cliquez sur une case pour retrouver ces bénévoles dans le tableau de bord.`}>
        {supply.withProfile === 0 ? (
          <Alert severity="info">Aucun profil renseigné pour l'instant.</Alert>
        ) : (
          <>
            <Typography variant="subtitle1" sx={{ mt: 1 }}>
              Nombre de tuteurs par matière et niveau
            </Typography>
            <Box sx={{ overflowX: 'auto', mb: 3 }}>
              <Table size="small" sx={{ width: 'auto' }}>
                <TableHead>
                  <TableRow>
                    <TableCell />
                    {supply.levels.map((l) => (
                      <TableCell key={l} align="center" sx={{ p: 0.5 }}>
                        {l}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {supply.subjects.map((subject) => (
                    <TableRow key={subject}>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {subject}
                      </TableCell>
                      {supply.levels.map((level) => {
                        const n = supply.matrix[subject][level] || 0;
                        return (
                          <HeatCell
                            key={level}
                            value={n}
                            max={matrixMax}
                            title={`${n} tuteur(s) en ${subject}, ${level}`}
                            onClick={() =>
                              openDashboard({
                                'dashboard.q.subject': subject,
                                'dashboard.q.levelFrom': level,
                                'dashboard.q.levelTo': level,
                              })
                            }
                          />
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>

            <Typography variant="subtitle1">
              Nombre de tuteurs disponibles par jour et heure
            </Typography>
            <Box sx={{ overflowX: 'auto', mb: 3 }}>
              <Table size="small" sx={{ width: 'auto' }}>
                <TableHead>
                  <TableRow>
                    <TableCell />
                    {supply.hours.map((h) => (
                      <TableCell key={h} align="center" sx={{ p: 0.5 }}>
                        {h}h
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {supply.days.map((day) => (
                    <TableRow key={day}>
                      <TableCell>{day}</TableCell>
                      {supply.hours.map((h) => {
                        const n = supply.slots[day][h] || 0;
                        const pad = (x) => String(x).padStart(2, '0');
                        return (
                          <HeatCell
                            key={h}
                            value={n}
                            max={slotsMax}
                            title={`${n} tuteur(s) libre(s) le ${day.toLowerCase()} de ${h}h à ${h + 1}h`}
                            onClick={() =>
                              openDashboard({
                                'dashboard.q.days': [day],
                                'dashboard.q.timeFrom': `${pad(h)}:00`,
                                'dashboard.q.timeTo': `${pad(h + 1)}:00`,
                              })
                            }
                          />
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>

            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Lieux possibles
            </Typography>
            {supply.places.map((p) => (
              <Bar
                key={p.label}
                label={p.label}
                value={p.count}
                max={supply.withProfile}
              />
            ))}
          </>
        )}
      </Section>

      <Section
        title="Recrutement"
        subtitle="Tous les bénévoles inscrits, selon leur statut actuel.">
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Parcours des candidats
            </Typography>
            {recruitment.funnel.map((f) => (
              <Bar
                key={f.stage}
                label={f.stage}
                value={f.count}
                max={registered}
                detail={`${percent(f.count, registered)} %`}
              />
            ))}
            <Typography variant="body2" color="text.secondary">
              Déclinées : {recruitment.declined}
            </Typography>
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Durée médiane
            </Typography>
            <Duration
              label="Inscription → dossier envoyé"
              value={recruitment.durations.registrationToSent}
            />
            <Duration
              label="Dossier envoyé → validation"
              value={recruitment.durations.sentToValidated}
            />
            <Typography variant="caption" color="text.secondary">
              {recruitment.durations.since
                ? `Historique des statuts enregistré depuis le ${new Date(
                    recruitment.durations.since
                  ).toLocaleDateString(
                    'fr-FR'
                  )} : les durées se précisent au fil des candidatures.`
                : "L'historique des statuts commence avec les prochains changements de statut."}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Par mission
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Mission</TableCell>
                    <TableCell align="right">Inscrits</TableCell>
                    <TableCell align="right">Dossier envoyé</TableCell>
                    <TableCell align="right">Validés</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recruitment.byMission.map((m) => (
                    <TableRow key={m.mission}>
                      <TableCell>{m.mission}</TableCell>
                      <TableCell align="right">{m.registered}</TableCell>
                      <TableCell align="right">{m.sent}</TableCell>
                      <TableCell align="right">{m.validated}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Grid>
        </Grid>

        <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
          Inscriptions par mois
        </Typography>
        <Box sx={{ overflowX: 'auto' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 0.5,
              height: 160,
              minWidth: recruitment.byMonth.length * 28,
            }}>
            {recruitment.byMonth.map((m) => (
              <Tooltip
                key={m.month}
                title={`${formatMonth(m.month)} : ${m.count} inscription(s)`}>
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    height: '100%',
                  }}>
                  <Typography variant="caption">{m.count || ''}</Typography>
                  <Box
                    sx={{
                      width: '100%',
                      height: `${(m.count / monthMax) * 120}px`,
                      minHeight: m.count ? 2 : 0,
                      bgcolor: 'primary.main',
                      borderRadius: '2px 2px 0 0',
                    }}
                  />
                </Box>
              </Tooltip>
            ))}
          </Box>
          <Box
            sx={{
              display: 'flex',
              gap: 0.5,
              minWidth: recruitment.byMonth.length * 28,
            }}>
            {recruitment.byMonth.map((m, i) => (
              <Typography
                key={m.month}
                variant="caption"
                color="text.secondary"
                sx={{ flex: 1, textAlign: 'center' }}>
                {i % 3 === 0 ? formatMonth(m.month) : ''}
              </Typography>
            ))}
          </Box>
        </Box>

        <Typography variant="subtitle1" sx={{ mt: 3 }}>
          Candidatures sans activité depuis plus de {recruitment.stuckDays}{' '}
          jours
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          D'après la date de dernière modification de la fiche.
        </Typography>
        {recruitment.stuck.length === 0 ? (
          <Alert severity="success">Aucune candidature en attente.</Alert>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Candidat</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="right">Sans activité depuis</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stuck.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell>
                      <Link
                        component="button"
                        onClick={() => openVolunteer(c.id)}>
                        {c.name}
                      </Link>
                    </TableCell>
                    <TableCell>{c.status}</TableCell>
                    <TableCell align="right">{c.days} jours</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {recruitment.stuck.length > 10 && (
              <Button
                size="small"
                onClick={() => setShowAll((s) => ({ ...s, stuck: !s.stuck }))}>
                {showAll.stuck
                  ? 'Réduire'
                  : `Voir les ${recruitment.stuck.length}`}
              </Button>
            )}
          </Box>
        )}
      </Section>
    </Container>
  );
};

export default Analysis;
