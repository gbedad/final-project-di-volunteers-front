import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Alert, Box, Button, Chip, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const KIND_LABEL = {
  regular: null,
  supplementaire: 'Séance supplémentaire',
  remplacement: 'Remplacement',
  pause: 'Pause',
};

// Exceptional sessions and replacements stand out: coloured chip and row tint
const KIND_COLOR = { supplementaire: 'secondary', remplacement: 'warning', pause: 'default' };
const KIND_TINT = {
  supplementaire: 'rgba(156, 39, 176, 0.08)',
  remplacement: 'rgba(237, 108, 2, 0.10)',
};

const DAY_FORMAT ={ weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' };
const dateLabel = (s) => new Date(`${s}T12:00:00Z`).toLocaleDateString('fr-FR', DAY_FORMAT);
const shift = (s, n) => {
  const d = new Date(`${s}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

// Rows of the week as a CSV file (opened in a spreadsheet)
const toCsv = (week) => {
  const head = ['Jour', 'Date', 'Début', 'Fin', 'Élève', 'Tuteur', 'Matières', 'Lieu', 'Type', 'Remarque'];
  const lines = [head];
  week.days.forEach((d) =>
    d.rows.forEach((r) =>
      lines.push([
        d.day,
        d.date,
        r.start,
        r.end,
        r.student,
        r.tutor,
        r.subjects.join(', '),
        r.remote ? 'À distance' : r.place,
        KIND_LABEL[r.kind] || '',
        r.remark,
      ])
    )
  );
  return lines
    .map((l) => l.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(';'))
    .join('\r\n');
};

const download = (name, text) => {
  const blob = new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};

// Rows of a day grouped by slot (same start and end): several pairs on the
// same slot are shown together under one heading
const slotGroups = (rows) => {
  const groups = [];
  const sorted = [...rows].sort(
    (a, b) => String(a.start).localeCompare(String(b.start)) || String(a.end).localeCompare(String(b.end)) || a.student.localeCompare(b.student)
  );
  for (const r of sorted) {
    const key = `${r.start}-${r.end}`;
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.rows.push(r);
    else groups.push({ key, start: r.start, end: r.end, rows: [r] });
  }
  return groups;
};

// Planning of one week: a block per day, one line per expected session
const WeekPlanning = () => {
  const [from, setFrom] = useState(null);
  const [week, setWeek] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setWeek(null);
    setError(false);
    axios
      .get(`${BASE_URL}/admin/binomes/planning`, { params: from ? { from } : {} })
      .then(({ data }) => {
        setWeek(data);
        if (!from) setFrom(data.from);
      })
      .catch(() => setError(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from]);

  const current = from || week?.from;

  return (
    <Box>
      <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 2 }} className="no-print">
        <Button size="small" variant="outlined" startIcon={<ChevronLeftIcon />} onClick={() => setFrom(shift(current, -7))} disabled={!current}>
          Semaine précédente
        </Button>
        <TextField
          size="small"
          type="date"
          label="Lundi de la semaine"
          value={current || ''}
          onChange={(e) => e.target.value && setFrom(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button size="small" variant="outlined" endIcon={<ChevronRightIcon />} onClick={() => setFrom(shift(current, 7))} disabled={!current}>
          Semaine suivante
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button size="small" variant="contained" disabled={!week} onClick={() => download(`planning-${week.from}.csv`, toCsv(week))}>
          Exporter en CSV
        </Button>
        <Button size="small" variant="outlined" disabled={!week} onClick={() => window.print()}>
          Imprimer
        </Button>
      </Stack>

      {error && <Alert severity="error">Le planning de la semaine n’a pas pu être chargé.</Alert>}
      {!error && !week && <Typography variant="body2">Chargement…</Typography>}

      {week && (
        <>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <b>
              {week.total} séance{week.total > 1 ? 's' : ''} prévue{week.total > 1 ? 's' : ''}
            </b>{' '}
            du {dateLabel(week.from)} au {dateLabel(week.to)}. Séances attendues d’après les créneaux des binômes actifs : rien n’est enregistré ici.
          </Typography>
          {week.days.map((d) => (
            <Paper key={d.date} variant="outlined" sx={{ mb: 2, p: 2 }}>
              <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                  {dateLabel(d.date)}
                </Typography>
                {d.off && <Chip size="small" label={d.off} color="warning" variant="outlined" />}
              </Stack>
              {d.rows.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Aucune séance prévue.
                </Typography>
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Horaire</TableCell>
                        <TableCell>Élève</TableCell>
                        <TableCell>Tuteur</TableCell>
                        <TableCell>Matières</TableCell>
                        <TableCell>Lieu</TableCell>
                        <TableCell>Remarque</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {slotGroups(d.rows).map((g) => {
                        const shared = g.rows.length > 1;
                        return (
                          <React.Fragment key={`${d.date}-${g.key}`}>
                            {shared && (
                              <TableRow>
                                <TableCell
                                  colSpan={6}
                                  sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', fontWeight: 600, py: 0.5 }}>
                                  {g.start}–{g.end} · {g.rows.length} binômes sur ce créneau
                                </TableCell>
                              </TableRow>
                            )}
                            {g.rows.map((r, i) => (
                              <TableRow
                                key={`${r.binome_id}-${r.kind}-${i}`}
                                sx={{
                                  opacity: r.kind === 'pause' ? 0.6 : 1,
                                  bgcolor: KIND_TINT[r.kind],
                                  ...(shared && { '& > td:first-of-type': { borderLeft: 4, borderLeftColor: 'primary.main' } }),
                                }}>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                  {shared ? '' : `${r.start}–${r.end}`}
                                  {KIND_LABEL[r.kind] && (
                                    <Chip
                                      size="small"
                                      label={KIND_LABEL[r.kind]}
                                      color={KIND_COLOR[r.kind]}
                                      sx={{ ml: shared ? 0 : 1, fontWeight: 600 }}
                                    />
                                  )}
                                </TableCell>
                                <TableCell>{r.student}</TableCell>
                                <TableCell>{r.tutor}</TableCell>
                                <TableCell>{r.subjects.join(', ')}</TableCell>
                                <TableCell>{r.remote ? 'À distance' : r.place}</TableCell>
                                <TableCell>{r.remark}</TableCell>
                              </TableRow>
                            ))}
                          </React.Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </Paper>
          ))}
        </>
      )}
    </Box>
  );
};

export default WeekPlanning;
