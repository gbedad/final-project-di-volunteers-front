import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import SchoolField, { schoolLabel } from '../students/SchoolField';

// Students and pairs of the paid tutoring. Only the paid rows: the free
// tutoring's students and pairs are not shown here (server: activiteAccess.js).
const BASE_URL = process.env.REACT_APP_BASE_URL;

const errorOf = (err) => err?.response?.data?.error || 'Erreur';
const frDay = (d) => (d ? new Date(`${String(d).slice(0, 10)}T12:00:00Z`).toLocaleDateString('fr-FR') : '');
const today = () => new Date().toISOString().slice(0, 10);

const PairStatus = ({ status }) => {
  const color = status === 'actif' ? 'success' : status === 'en pause' ? 'warning' : 'default';
  return <Chip size="small" color={color} label={status} />;
};

const PaidStudents = () => {
  const [students, setStudents] = useState([]);
  const [pairs, setPairs] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [dialog, setDialog] = useState(null); // 'student' | 'pair'
  const [form, setForm] = useState({});

  const load = useCallback(() => {
    axios
      .get(`${BASE_URL}/payant/eleves`)
      .then((r) => setStudents(r.data))
      .catch((e) => toast.error(errorOf(e)));
    axios
      .get(`${BASE_URL}/payant/binomes`)
      .then((r) => setPairs(r.data))
      .catch((e) => toast.error(errorOf(e)));
  }, []);

  useEffect(() => {
    load();
    axios
      .get(`${BASE_URL}/payant/tuteurs`)
      .then((r) => setTutors(r.data))
      .catch((e) => toast.error(errorOf(e)));
  }, [load]);

  const open = (kind) => {
    setForm(
      kind === 'student'
        ? { first_name: '', last_name: '', email: '', phone: '', level: '', school: null, comment: '' }
        : { student_id: '', tutor_id: '', subjects: '', start_date: today(), note: '' }
    );
    setDialog(kind);
  };

  const submit = async () => {
    try {
      if (dialog === 'student') {
        await axios.post(`${BASE_URL}/payant/eleves`, form);
        toast.success('Élève créé');
      } else {
        await axios.post(`${BASE_URL}/payant/binomes`, {
          student_id: Number(form.student_id),
          tutor_id: Number(form.tutor_id),
          subjects: form.subjects.split(',').map((s) => s.trim()),
          start_date: form.start_date,
          note: form.note,
        });
        toast.success('Binôme créé');
      }
      setDialog(null);
      load();
    } catch (e) {
      toast.error(errorOf(e));
    }
  };

  const endPair = async (pair) => {
    if (!window.confirm(`Terminer le binôme ${pair.student} – ${pair.tutor} ?`)) return;
    try {
      await axios.patch(`${BASE_URL}/payant/binomes/${pair.id}`, { status: 'terminé' });
      toast.success('Binôme terminé');
      load();
    } catch (e) {
      toast.error(errorOf(e));
    }
  };

  const activePairs = pairs.filter((p) => p.status !== 'terminé');

  return (
    <>
      <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button variant="outlined" onClick={() => open('student')}>
          Nouvel élève
        </Button>
        <Button variant="contained" onClick={() => open('pair')} disabled={!students.length || !tutors.length}>
          Nouveau binôme
        </Button>
      </Stack>

      <Typography variant="h6" component="h2" gutterBottom>
        Binômes en cours ({activePairs.length})
      </Typography>
      <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Élève</TableCell>
              <TableCell>Tuteur</TableCell>
              <TableCell>Matières</TableCell>
              <TableCell>Début</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activePairs.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell>{p.student}</TableCell>
                <TableCell>{p.tutor}</TableCell>
                <TableCell>{(p.subjects || []).join(', ')}</TableCell>
                <TableCell>{frDay(p.start_date)}</TableCell>
                <TableCell>
                  <PairStatus status={p.status} />
                </TableCell>
                <TableCell align="right">
                  <Button size="small" color="error" onClick={() => endPair(p)}>
                    Terminer
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!activePairs.length && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography variant="body2" color="text.secondary">
                    Aucun binôme en cours.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Typography variant="h6" component="h2" gutterBottom>
        Élèves payants ({students.length})
      </Typography>
      <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Niveau</TableCell>
              <TableCell>Établissement</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Tuteur(s)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((s) => (
              <TableRow key={s.id} hover>
                <TableCell>
                  {s.first_name} {s.last_name}
                </TableCell>
                <TableCell>{s.level}</TableCell>
                <TableCell>{schoolLabel(s.school)}</TableCell>
                <TableCell>{[s.email, s.phone].filter(Boolean).join(' · ')}</TableCell>
                <TableCell>
                  {(s.pairs || [])
                    .filter((p) => p.status !== 'terminé')
                    .map((p) => p.tutor)
                    .join(', ') || <Chip size="small" label="Sans tuteur" />}
                </TableCell>
              </TableRow>
            ))}
            {!students.length && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography variant="body2" color="text.secondary">
                    Aucun élève payant pour l’instant.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={!!dialog} onClose={() => setDialog(null)} fullWidth maxWidth="xs">
        <DialogTitle>{dialog === 'student' ? 'Nouvel élève payant' : 'Nouveau binôme'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {dialog === 'student' && (
              <>
                <TextField label="Prénom" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
                <TextField label="Nom" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
                <TextField label="E-mail (facultatif)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <TextField label="Téléphone (facultatif)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <TextField label="Niveau" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} />
                <SchoolField
                  value={form.school}
                  level={form.level}
                  onChange={(school) => setForm({ ...form, school })}
                />
                <TextField label="Remarque (facultatif)" multiline minRows={2} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
              </>
            )}
            {dialog === 'pair' && (
              <>
                <TextField select label="Élève" value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })}>
                  {students.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.first_name} {s.last_name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField select label="Tuteur" value={form.tutor_id} onChange={(e) => setForm({ ...form, tutor_id: e.target.value })}>
                  {tutors.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.first_name} {t.last_name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField label="Matières (séparées par des virgules)" value={form.subjects} onChange={(e) => setForm({ ...form, subjects: e.target.value })} />
                <TextField type="date" label="Début" InputLabelProps={{ shrink: true }} value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                <TextField label="Remarque (facultatif)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
                <Alert severity="info">Le binôme démarre tout de suite, sans acceptation du tuteur.</Alert>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>Annuler</Button>
          <Button variant="contained" onClick={submit}>
            Valider
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PaidStudents;
