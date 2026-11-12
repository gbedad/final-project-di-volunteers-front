import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PageHeader from './PageHeader';
import { STATUS } from '../students/StudentPayments';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const euro = (n) =>
  `${Number(n || 0).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} €`;
const frDay = (d) =>
  d ? new Date(`${d}T12:00:00Z`).toLocaleDateString('fr-FR') : '';
const iso = (d) => d.toISOString().slice(0, 10);
const NATURES = {
  cotisation: 'Cotisation',
  participation: 'Participation',
  forfait: 'Forfait 5 h',
  caution: 'Caution',
  sortie: 'Sortie',
};
// Periods offered (from, to)
const periods = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const sy = m >= 8 ? y : y - 1;
  return {
    mois: [
      'Ce mois-ci',
      iso(new Date(Date.UTC(y, m, 1))),
      iso(new Date(Date.UTC(y, m + 1, 0))),
    ],
    mois_precedent: [
      'Le mois dernier',
      iso(new Date(Date.UTC(y, m - 1, 1))),
      iso(new Date(Date.UTC(y, m, 0))),
    ],
    annee: [`Année scolaire ${sy}-${sy + 1}`, `${sy}-09-01`, `${sy + 1}-08-31`],
    precedente: [
      `Année scolaire ${sy - 1}-${sy}`,
      `${sy - 1}-09-01`,
      `${sy}-08-31`,
    ],
  };
};
const csv = (rows) =>
  [
    [
      'Date',
      'Élève',
      'Nature',
      'Détail',
      'Montant',
      'Moyen',
      'Exceptionnel',
      'Référence',
    ],
    ...rows.map((r) => [
      r.date,
      r.student,
      NATURES[r.nature] || r.nature,
      r.detail || '',
      String(r.amount).replace('.', ','),
      r.method_label,
      r.exceptional ? 'oui' : 'non',
      r.reference || '',
    ]),
  ]
    .map((line) =>
      line.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(';')
    )
    .join('\n');

const Ledger = () => {
  const P = periods();
  const [period, setPeriod] = useState('annee');
  const [nature, setNature] = useState('');
  const [method, setMethod] = useState('');
  const [data, setData] = useState(null);
  useEffect(() => {
    setData(null);
    const [, from, to] = P[period];
    axios
      .get(`${BASE_URL}/admin/encaissements`, { params: { from, to } })
      .then(({ data }) => setData(data))
      .catch(() =>
        setData({
          rows: [],
          by_method: [],
          by_nature: [],
          total: 0,
          error: true,
        })
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);
  const rows = useMemo(
    () =>
      (data?.rows || []).filter(
        (r) =>
          (!nature || r.nature === nature) &&
          (!method || r.method_label === method)
      ),
    [data, nature, method]
  );
  const download = () => {
    const blob = new Blob([`﻿${csv(rows)}`], {
      type: 'text/csv;charset=utf-8',
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `encaissements-${P[period][1]}-${P[period][2]}.csv`;
    a.click();
  };
  if (!data) return <LinearProgress />;
  const total = rows.reduce((n, r) => n + r.amount, 0);
  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <TextField
          select
          size="small"
          label="Période"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          sx={{ minWidth: 220 }}>
          {Object.entries(P).map(([k, [label]]) => (
            <MenuItem key={k} value={k}>
              {label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Nature"
          value={nature}
          onChange={(e) => setNature(e.target.value)}
          sx={{ minWidth: 160 }}>
          <MenuItem value="">Toutes</MenuItem>
          {Object.entries(NATURES).map(([k, l]) => (
            <MenuItem key={k} value={k}>
              {l}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Moyen"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          sx={{ minWidth: 170 }}>
          <MenuItem value="">Tous</MenuItem>
          {data.by_method.map((m) => (
            <MenuItem key={m.label} value={m.label}>
              {m.label}
            </MenuItem>
          ))}
        </TextField>
        <Button
          startIcon={<DownloadIcon />}
          onClick={download}
          disabled={!rows.length}>
          Export CSV
        </Button>
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
        }}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Total encaissé
          </Typography>
          <Typography variant="h5">{euro(data.total)}</Typography>
          <Typography
            variant="body2"
            color={data.exceptional ? 'warning.dark' : 'text.secondary'}>
            dont {euro(data.exceptional)} par un moyen exceptionnel
          </Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Par moyen
          </Typography>
          {data.by_method.map((m) => (
            <Stack key={m.label} direction="row" justifyContent="space-between">
              <Typography variant="body2">{m.label}</Typography>
              <Typography variant="body2">{euro(m.amount)}</Typography>
            </Stack>
          ))}
        </Paper>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Par nature
          </Typography>
          {data.by_nature.map((m) => (
            <Stack key={m.label} direction="row" justifyContent="space-between">
              <Typography variant="body2">
                {NATURES[m.label] || m.label}
              </Typography>
              <Typography variant="body2">{euro(m.amount)}</Typography>
            </Stack>
          ))}
        </Paper>
      </Box>
      {data.undated_memberships > 0 && (
        <Alert severity="info">
          {data.undated_memberships} cotisation
          {data.undated_memberships > 1 ? 's' : ''} reprise
          {data.undated_memberships > 1 ? 's' : ''} sans date de paiement
          (fichier Excel) : non comptée
          {data.undated_memberships > 1 ? 's' : ''} ici.
        </Alert>
      )}
      <Typography variant="body2">
        {rows.length} ligne{rows.length > 1 ? 's' : ''} · {euro(total)}
      </Typography>
      <Stack spacing={0.5}>
        {rows.map((r, k) => (
          <Paper key={k} variant="outlined" sx={{ px: 1.5, py: 1 }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap>
              <Typography variant="body2" sx={{ width: 85 }}>
                {frDay(r.date)}
              </Typography>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ flex: 1, minWidth: 140 }}>
                {r.student}
              </Typography>
              <Typography variant="body2" sx={{ minWidth: 150 }}>
                {NATURES[r.nature] || r.nature}
                {r.detail ? ` · ${r.detail}` : ''}
              </Typography>
              <Chip
                size="small"
                variant="outlined"
                color={r.exceptional ? 'warning' : 'default'}
                label={r.method_label}
              />
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ width: 80, textAlign: 'right' }}>
                {euro(r.amount)}
              </Typography>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Stack>
  );
};

const ToCollect = () => {
  const navigate = useNavigate();
  const [list, setList] = useState(null);
  useEffect(() => {
    axios
      .get(`${BASE_URL}/admin/encaissements/a-encaisser`)
      .then(({ data }) => setList(data))
      .catch(() => setList([]));
  }, []);
  if (!list) return <LinearProgress />;
  if (!list.length) return <Alert severity="success">Rien à encaisser.</Alert>;
  return (
    <Stack spacing={1}>
      <Typography variant="body2">
        {list.length} famille{list.length > 1 ? 's' : ''} ·{' '}
        {euro(list.reduce((n, s) => n + s.owed, 0))} à encaisser. Envoyez le
        lien AssoConnect, puis enregistrez le paiement sur la fiche de l'élève.
      </Typography>
      {list.map((s) => (
        <Paper
          key={s.id}
          variant="outlined"
          sx={{ p: 1.5, cursor: 'pointer' }}
          onClick={() => navigate(`/eleves/${s.id}`)}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap>
            <Typography fontWeight={600} sx={{ flex: 1 }}>
              {s.name}
            </Typography>
            {s.late && <Chip size="small" color="error" label="en retard" />}
            <Typography fontWeight={600}>{euro(s.owed)}</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {s.items
              .map(
                (i) =>
                  `${i.label} ${euro(i.amount)}${i.status === 'en retard' ? ' (en retard)' : ''}`
              )
              .join(' · ')}
          </Typography>
          {s.parent && (
            <Typography variant="caption" color="text.secondary">
              Parent : {s.parent}
            </Typography>
          )}
          {s.no_fee && (
            <Typography variant="caption" color="warning.dark" display="block">
              Participation non calculée : QF à saisir.
            </Typography>
          )}
        </Paper>
      ))}
    </Stack>
  );
};

const Deposits = () => {
  const [list, setList] = useState(null);
  const load = useCallback(() => {
    axios
      .get(`${BASE_URL}/admin/encaissements/cautions`)
      .then(({ data }) => setList(data))
      .catch(() => setList([]));
  }, []);
  useEffect(load, [load]);
  const mark = async (d, status) => {
    try {
      await axios.patch(`${BASE_URL}/admin/lignes-paiement/${d.id}/caution`, {
        status,
      });
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Enregistrement impossible', {
        position: 'bottom-left',
      });
    }
  };
  if (!list) return <LinearProgress />;
  if (!list.length)
    return (
      <Alert severity="info">Aucune caution enregistrée cette année.</Alert>
    );
  const held = list.filter((d) => d.status === 'reçue');
  return (
    <Stack spacing={1}>
      <Typography variant="body2">
        {held.length} caution{held.length > 1 ? 's' : ''} détenue
        {held.length > 1 ? 's' : ''} ·{' '}
        {euro(held.reduce((n, d) => n + d.amount, 0))}. En fin d'année : «
        Rendue », ou « Encaissée » si elle est gardée.
      </Typography>
      {list.map((d) => (
        <Paper key={d.id} variant="outlined" sx={{ p: 1.5 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems={{ sm: 'center' }}>
            <Box sx={{ flex: 1 }}>
              <Typography fontWeight={600}>
                {d.student} · {euro(d.amount)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Reçue le {frDay(d.paid_at)} ({d.method_label})
                {d.status !== 'reçue'
                  ? ` · ${d.status} le ${frDay(d.status_at)}`
                  : ''}
              </Typography>
            </Box>
            <Chip
              size="small"
              color={STATUS[d.status]?.color}
              label={d.status}
            />
            {d.status === 'reçue' ? (
              <Stack direction="row" spacing={1}>
                <Button size="small" onClick={() => mark(d, 'rendue')}>
                  Rendue
                </Button>
                <Button
                  size="small"
                  color="inherit"
                  onClick={() => mark(d, 'encaissée')}>
                  Encaissée
                </Button>
              </Stack>
            ) : (
              <Button
                size="small"
                color="inherit"
                onClick={() => mark(d, 'reçue')}>
                Annuler
              </Button>
            )}
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
};

// Bookkeeping of the families' payments (admins)
const AccountingPage = () => {
  const location = useLocation();
  const [tab, setTab] = useState(
    location.state?.open === 'a-encaisser' ? 1 : 0
  );
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <PageHeader
        title="Encaissements"
        subtitle="Ce que les familles ont payé (cotisation, participation, forfaits, cautions, sorties) et par quel moyen. Le lien AssoConnect est le moyen habituel ; les autres sont exceptionnels."
      />
      <Tabs
        value={tab}
        onChange={(e, v) => setTab(v)}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Encaissements" />
        <Tab label="À encaisser" />
        <Tab label="Cautions" />
      </Tabs>
      {tab === 0 && <Ledger />}
      {tab === 1 && <ToCollect />}
      {tab === 2 && <Deposits />}
    </Container>
  );
};

export default AccountingPage;
