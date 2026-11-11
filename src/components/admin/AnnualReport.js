import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Alert,
  Box,
  Button,
  Container,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const fr = (n) =>
  n === null || n === undefined
    ? '—'
    : Number(n).toLocaleString('fr-FR', { maximumFractionDigits: 1 });
// "1er septembre 2026" (French ordinal on the first of the month)
const frDate = (s) =>
  new Date(`${s}T12:00:00Z`)
    .toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    .replace(/^1 /, '1er ');
const monthLabel = (m) =>
  new Date(`${m}-15T12:00:00Z`).toLocaleDateString('fr-FR', {
    month: 'long',
  });
// School years offered: the current one and the three before
const years = () => {
  const now = new Date();
  const y = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  return [0, 1, 2, 3].map((i) => `${y - i}-${y - i + 1}`);
};

// Printed: no menu, no buttons, figures kept together
const PRINT_CSS = `
@media print {
  .MuiAppBar-root, .MuiBottomNavigation-root, .MuiAlert-root, .no-print, nav, footer { display: none !important; }
  .MuiBottomNavigation-root ~ *, .MuiBottomNavigation-root + * { display: none !important; }
  body { background: #fff !important; }
  .report-block { break-inside: avoid; }
  .report-page { margin: 0 !important; max-width: none !important; }
}`;

const Figure = ({ value, label, detail }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography
      variant="h4"
      color="primary"
      sx={{ fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
      {value}
    </Typography>
    <Typography variant="body2" fontWeight={600}>
      {label}
    </Typography>
    {detail && (
      <Typography variant="caption" color="text.secondary">
        {detail}
      </Typography>
    )}
  </Box>
);

// One row of a breakdown: label, value, bar to scale
const Bars = ({ rows, valueKey = 'count', unit = '', total }) => {
  const max = Math.max(1, ...rows.map((r) => r[valueKey]));
  return (
    <Stack spacing={0.75}>
      {rows.map((r) => (
        <Box
          key={r.label}
          sx={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 11rem) 1fr auto',
            gap: 1.5,
            alignItems: 'center',
          }}>
          <Typography variant="body2" noWrap title={r.label}>
            {r.label}
          </Typography>
          <Box sx={{ bgcolor: 'action.hover', borderRadius: 1, height: 10 }}>
            <Box
              sx={{
                width: `${(r[valueKey] / max) * 100}%`,
                bgcolor: 'primary.main',
                height: '100%',
                borderRadius: 1,
              }}
            />
          </Box>
          <Typography
            variant="body2"
            sx={{
              fontVariantNumeric: 'tabular-nums',
              minWidth: 72,
              textAlign: 'right',
            }}>
            {fr(r[valueKey])}
            {unit}
            {total ? ` (${Math.round((r[valueKey] * 100) / total)} %)` : ''}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
};

const Section = ({ title, children, note }) => (
  <Paper
    variant="outlined"
    className="report-block"
    sx={{ p: 2.5, minWidth: 0 }}>
    <Typography variant="h6" component="h2" sx={{ mb: 1.5 }}>
      {title}
    </Typography>
    {children}
    {note && (
      <Typography
        variant="caption"
        color="text.secondary"
        component="p"
        sx={{ mt: 1.5 }}>
        {note}
      </Typography>
    )}
  </Paper>
);

// Annual report for the funders: one school year, printable
const AnnualReport = () => {
  const [year, setYear] = useState(years()[0]);
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    setData(null);
    setError(false);
    axios
      .get(`${BASE_URL}/admin/annual-report`, { params: { year } })
      .then(({ data }) => setData(data))
      .catch(() => setError(true));
  }, [year]);

  const f = data?.figures;
  const summary = data
    ? [
        `Association Séphora Berrebi – tutorat bénévole, année ${data.year} (du ${frDate(data.from)} au ${frDate(data.to)}${data.complete ? '' : ', année en cours'}).`,
        `${f.students} élèves accompagnés par ${f.tutors} tuteurs bénévoles, dans ${f.pairs} binômes.`,
        `${f.sessions} séances réalisées, soit ${fr(f.hours)} heures de tutorat (dont ${fr(f.remote_hours)} h à distance).`,
        `Élèves : ${data.cycles.map((c) => `${c.count} en ${c.label.toLowerCase()}`).join(', ')}, venant de ${data.schools.count} établissements.`,
        `Quotient familial médian : ${data.qf.median !== null ? `${fr(data.qf.median)} €` : 'non disponible'}.`,
      ].join('\n')
    : '';
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      toast.success('Résumé copié', { position: 'bottom-left' });
    } catch {
      toast.error('Copie impossible : sélectionnez le texte à la main', {
        position: 'bottom-left',
      });
    }
  };

  return (
    <Container maxWidth="lg" className="report-page" sx={{ mt: 4, mb: 6 }}>
      <style>{PRINT_CSS}</style>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        flexWrap="wrap"
        gap={2}
        sx={{ mb: 3 }}>
        <Box>
          <Typography variant="overline" color="text.secondary">
            Association Séphora Berrebi · tutorat bénévole
          </Typography>
          <Typography variant="h4" component="h1">
            Rapport d'activité {data?.year || year}
          </Typography>
          {data && (
            <Typography color="text.secondary">
              Du {frDate(data.from)} au {frDate(data.to)}
              {data.complete ? '' : ' (année en cours)'}
            </Typography>
          )}
        </Box>
        <Stack
          direction="row"
          spacing={1}
          className="no-print"
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
          <Button
            startIcon={<ContentCopyIcon />}
            disabled={!data}
            onClick={copy}>
            Copier le résumé
          </Button>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            disabled={!data}
            onClick={() => window.print()}>
            Imprimer / PDF
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error">Le rapport n'a pas pu être calculé.</Alert>
      )}
      {!data && !error && <LinearProgress />}
      {data && f.sessions === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Aucune séance enregistrée dans MyCogniverse pour cette année : le
          suivi des séances a commencé à la rentrée 2026.
        </Alert>
      )}

      {data && (
        <Stack spacing={2.5}>
          <Paper variant="outlined" className="report-block" sx={{ p: 2.5 }}>
            <Box
              sx={{
                display: 'grid',
                gap: 3,
                gridTemplateColumns: {
                  xs: '1fr 1fr',
                  md: 'repeat(4, 1fr)',
                },
              }}>
              <Figure value={f.students} label="élèves accompagnés" />
              <Figure
                value={f.tutors}
                label="tuteurs bénévoles"
                detail={`dont ${f.tutors_with_sessions} avec des séances enregistrées`}
              />
              <Figure
                value={fr(f.hours)}
                label="heures de tutorat"
                detail={`dont ${fr(f.remote_hours)} h à distance`}
              />
              <Figure
                value={f.sessions}
                label="séances réalisées"
                detail={`${f.pairs} binômes`}
              />
              <Figure
                value={f.absence_rate === null ? '—' : `${f.absence_rate} %`}
                label="taux d'absence"
                detail={`${f.absences} absence${f.absences > 1 ? 's' : ''} enregistrée${f.absences > 1 ? 's' : ''}`}
              />
              <Figure
                value={data.schools.count}
                label="établissements scolaires"
              />
              <Figure
                value={
                  data.qf.median !== null ? `${fr(data.qf.median)} €` : '—'
                }
                label="quotient familial médian"
                detail={`sur ${data.qf.known} famille${data.qf.known > 1 ? 's' : ''} ayant communiqué leur QF`}
              />
              <Figure
                value={f.waiting_now}
                label="élèves en attente d'un tuteur"
                detail="aujourd'hui"
              />
            </Box>
          </Paper>

          <Box
            sx={{
              display: 'grid',
              gap: 2.5,
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              alignItems: 'start',
            }}>
            <Section title="Niveaux scolaires">
              <Bars rows={data.cycles} total={f.students} />
              <Box sx={{ mt: 2 }}>
                <Bars rows={data.levels} />
              </Box>
            </Section>
            <Section
              title="Quotient familial"
              note="Tranches du barème de participation de l'association (tranche 1 : QF jusqu'à 234 € ; tranche 7 : jusqu'à 2 500 €).">
              <Bars rows={data.qf.tranches} total={f.students} />
            </Section>
            <Section
              title="Établissements"
              note="Éducation prioritaire selon l'annuaire officiel de l'Éducation nationale.">
              <Bars rows={data.schools.priority} total={f.students} />
              <Box sx={{ mt: 2 }}>
                <Bars rows={data.schools.sector} total={f.students} />
              </Box>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ mt: 2, mb: 1 }}>
                Principaux établissements
              </Typography>
              <Bars rows={data.schools.top} />
            </Section>
            <Section
              title="Heures par matière"
              note="Les heures d'un binôme qui suit plusieurs matières sont réparties entre elles.">
              <Bars rows={data.subjects} valueKey="hours" unit=" h" />
            </Section>
            <Section title="Heures de tutorat par mois">
              <Bars
                rows={data.months.map((m) => ({
                  label: monthLabel(m.month),
                  hours: m.hours,
                }))}
                valueKey="hours"
                unit=" h"
              />
            </Section>
          </Box>

          <Paper
            variant="outlined"
            className="report-block no-print"
            sx={{ p: 2.5 }}>
            <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
              Résumé à copier
            </Typography>
            <Typography
              component="pre"
              variant="body2"
              sx={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', m: 0 }}>
              {summary}
            </Typography>
          </Paper>
          <Typography variant="caption" color="text.secondary">
            Chiffres tirés de MyCogniverse le{' '}
            {frDate(
              new Date().toLocaleDateString('sv-SE', {
                timeZone: 'Europe/Paris',
              })
            )}{' '}
            : séances émargées dans l'application, signées sur Jotform, tenues
            sur Zoom ou confirmées par l'équipe. Comptes de démonstration
            exclus.
          </Typography>
        </Stack>
      )}
    </Container>
  );
};

export default AnnualReport;
