import React, { useRef, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Collapse,
  FormControlLabel,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DescriptionIcon from '@mui/icons-material/Description';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const PROOFS = [
  { value: 'caf', label: 'Attestation CAF (juin ou septembre)' },
  { value: 'avis', label: "Avis d'imposition" },
  { value: 'none', label: 'La famille ne communique pas son QF' },
];
const euros = (n) =>
  n === null || n === undefined
    ? '—'
    : `${Number(n).toLocaleString('fr-FR', {
        minimumFractionDigits: Number(n) % 1 ? 2 : 0,
        maximumFractionDigits: 2,
      })} €`;
const hoursText = (h) => `${String(h).replace('.', ',')} h`;

// Amount typed with a comma or spaces ("1 234,50")
const parseAmount = (v) => {
  const s = String(v ?? '')
    .replace(/\s/g, '')
    .replace(',', '.');
  return s === '' ? null : s;
};

// "Participation aux frais" block of the student's page. fee and fee_terms
// are computed by the server (services/fees.js) and reloaded after a save.
const StudentFees = ({ student, canEdit, set }) => {
  const [income, setIncome] = useState('');
  const [parts, setParts] = useState('');
  const [showCalc, setShowCalc] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef(null);
  const fee = student.fee;
  const proof = student.qf_proof || '';
  const hasQf = proof === 'caf' || proof === 'avis';
  const hourly = fee?.mode === 'hourly';

  const computeQf = () => {
    const i = Number(parseAmount(income));
    const p = Number(parseAmount(parts));
    if (!(i > 0 && p > 0)) return;
    set('qf', Math.round((i / 12 / p) * 100) / 100);
    setShowCalc(false);
  };

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const { data } = await axios.post(
        `${BASE_URL}/admin/students/${student.id}/qf-proof`,
        form,
      );
      set('qf_file', data, false);
      toast.success('Justificatif enregistré', { position: 'bottom-left' });
    } catch {
      toast.error("Le justificatif n'a pas pu être enregistré", {
        position: 'bottom-left',
      });
    } finally {
      setUploading(false);
    }
  };
  const openProof = async () => {
    try {
      const { data } = await axios.post(`${BASE_URL}/students/files/url`, {
        path: student.qf_file.path,
      });
      window.open(data.url, '_blank', 'noopener');
    } catch {
      toast.error("Le document n'a pas pu être ouvert", {
        position: 'bottom-left',
      });
    }
  };

  return (
    <Stack spacing={1.5}>
      <TextField
        select
        size="small"
        label="Justificatif du quotient familial"
        value={proof}
        disabled={!canEdit}
        onChange={(e) => set('qf_proof', e.target.value || null)}>
        {PROOFS.map((p) => (
          <MenuItem key={p.value} value={p.value}>
            {p.label}
          </MenuItem>
        ))}
      </TextField>

      {hasQf && (
        <>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              label="Quotient familial (€)"
              value={student.qf ?? ''}
              disabled={!canEdit}
              onChange={(e) => set('qf', parseAmount(e.target.value))}
              inputProps={{ inputMode: 'decimal' }}
              sx={{ flex: 1 }}
            />
            {proof === 'avis' && canEdit && (
              <Button size="small" onClick={() => setShowCalc(!showCalc)}>
                Calculer
              </Button>
            )}
          </Stack>
          {proof === 'avis' && (
            <Collapse in={showCalc}>
              <Stack
                spacing={1}
                sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  QF = revenu fiscal de référence / 12 / nombre de parts
                </Typography>
                <Stack direction="row" spacing={1}>
                  <TextField
                    size="small"
                    label="Revenu fiscal de référence (€)"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    inputProps={{ inputMode: 'decimal' }}
                  />
                  <TextField
                    size="small"
                    label="Parts"
                    value={parts}
                    onChange={(e) => setParts(e.target.value)}
                    inputProps={{ inputMode: 'decimal' }}
                    sx={{ width: 90 }}
                  />
                </Stack>
                <Button size="small" variant="outlined" onClick={computeQf}>
                  Reporter le QF
                </Button>
              </Stack>
            </Collapse>
          )}
          <Stack direction="row" spacing={1} alignItems="center">
            {student.qf_file ? (
              <Button
                size="small"
                startIcon={<DescriptionIcon />}
                onClick={openProof}>
                Voir le justificatif
              </Button>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Justificatif non déposé
              </Typography>
            )}
            {canEdit && (
              <>
                <Button
                  size="small"
                  startIcon={<UploadFileIcon />}
                  disabled={uploading}
                  onClick={() => fileInput.current?.click()}>
                  {student.qf_file ? 'Remplacer' : 'Déposer'}
                </Button>
                <input
                  ref={fileInput}
                  type="file"
                  hidden
                  accept="application/pdf,image/*"
                  onChange={(e) => {
                    upload(e.target.files[0]);
                    e.target.value = '';
                  }}
                />
              </>
            )}
          </Stack>
        </>
      )}

      {hourly && (
        <FormControlLabel
          disabled={!canEdit}
          control={
            <Checkbox
              size="small"
              checked={!!student.fee_special}
              onChange={(e) => set('fee_special', e.target.checked)}
            />
          }
          label={
            <Typography variant="body2">
              Tarif « Autres » : troubles de l'apprentissage, remédiation, cours
              particuliers STEM
            </Typography>
          }
        />
      )}

      {!fee ? (
        <Alert severity="info">
          Indiquez le justificatif et le QF pour calculer la participation.
        </Alert>
      ) : fee.missing === 'level' ? (
        <Alert severity="warning">
          Renseignez le niveau de l'élève pour trouver son tarif horaire.
        </Alert>
      ) : (
        <Alert severity="success" icon={false}>
          <Typography fontWeight={600}>
            {fee.mode === 'term'
              ? `Tranche ${fee.tranche} : ${euros(fee.amount)} par trimestre`
              : `${euros(fee.amount)} de l'heure`}
          </Typography>
          <Typography variant="body2">
            {fee.mode === 'term'
              ? `Caution : ${euros(fee.deposit)}`
              : `${fee.tranche ? 'Tranche 8 et plus' : 'QF non communiqué'} · ${
                  fee.row
                } · forfait 5 heures : ${euros(fee.pack5)} · pas de caution`}
          </Typography>
          {fee.computed !== fee.amount && (
            <Typography variant="body2">
              Montant corrigé (calculé : {euros(fee.computed)})
              {fee.override_reason ? ` · ${fee.override_reason}` : ''}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary">
            Barème {fee.year}. Ce montant figure dans l'accord envoyé aux
            parents.
          </Typography>
        </Alert>
      )}

      {fee && !fee.missing && canEdit && (
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            label={
              fee.mode === 'term'
                ? 'Montant corrigé / trimestre'
                : 'Tarif corrigé / heure'
            }
            value={student.fee_override ?? ''}
            onChange={(e) => set('fee_override', parseAmount(e.target.value))}
            inputProps={{ inputMode: 'decimal' }}
            sx={{ width: 190 }}
          />
          <TextField
            size="small"
            label="Motif (geste solidaire, fratrie…)"
            value={student.fee_override_reason || ''}
            onChange={(e) => set('fee_override_reason', e.target.value)}
            disabled={
              student.fee_override === null ||
              student.fee_override === undefined ||
              student.fee_override === ''
            }
            sx={{ flex: 1 }}
          />
        </Stack>
      )}

      {fee && !fee.missing && (student.fee_terms || []).length > 0 && (
        <Box>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
            {fee.mode === 'hourly'
              ? 'Montant dû selon les comptes-rendus de séance'
              : 'Tutorat réalisé'}
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Trimestre</TableCell>
                <TableCell align="right">Heures</TableCell>
                <TableCell align="right">Montant</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {student.fee_terms.map((t) => (
                <TableRow key={t.key}>
                  <TableCell>{t.label}</TableCell>
                  <TableCell align="right">{hoursText(t.hours)}</TableCell>
                  <TableCell align="right">{euros(t.due)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Stack>
  );
};

export default StudentFees;
