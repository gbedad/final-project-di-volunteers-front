import React, { useState } from 'react';
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
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import ErrorIcon from '@mui/icons-material/Error';
import ReportIcon from '@mui/icons-material/Report';
import RemoveIcon from '@mui/icons-material/Remove';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const frDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '');
const channel = (c) => (c === 'whatsapp' ? 'WhatsApp' : 'e-mail');
const LAST = {
  expired: 'lien expiré',
  locked: 'lien bloqué (trop d’essais)',
  revoked: 'accord retiré',
  cancelled: 'demande annulée',
};

// Filter of the list: one of these, or null
export const CONSENT_FILTERS = [
  { value: 'missing', label: 'Manquant', color: 'error' },
  { value: 'pending', label: 'En attente', color: 'warning' },
  { value: 'signed', label: 'Signé', color: 'success' },
];

// Students counted: current requests only (not finished or abandoned)
export const consentGroup = (s) => {
  const c = s.consent;
  if (!c?.needed) return null;
  if (c.state === 'signed' || c.state === 'paper') return 'signed';
  return c.state;
};
export const pairWithoutConsent = (s) =>
  !!s.consent?.needed && s.consent.open_pair && consentGroup(s) !== 'signed';

// Sort order of the column: what needs action first
export const consentRank = (s) =>
  pairWithoutConsent(s)
    ? 0
    : ({ missing: 1, pending: 2, signed: 3 }[consentGroup(s)] ?? 4);

const describe = (s) => {
  const c = s.consent || {};
  switch (c.state) {
    case 'signed':
      return `Signé en ligne le ${frDate(c.at)} par ${c.signer_name} (${c.signer_relation})`;
    case 'paper':
      return `Reçu sur papier le ${frDate(c.at)}`;
    case 'pending':
      return `Lien envoyé le ${frDate(c.at)} par ${channel(c.channel)}${
        c.reminder ? ' (relance automatique)' : ''
      }, expire le ${frDate(c.expires_at)}`;
    default:
      return c.last
        ? `Pas d'accord : ${LAST[c.last] || c.last} (${frDate(c.at)})`
        : "Pas d'accord : aucune demande envoyée";
  }
};

// Icon of the "Accord parents" column; a click asks for the consent
export const ConsentCell = ({ student, canEdit, onAsk }) => {
  const group = consentGroup(student);
  const urgent = pairWithoutConsent(student);
  const clickable = canEdit && (group === 'missing' || group === 'pending');
  const title = [
    describe(student),
    urgent && 'Un tuteur est proposé ou actif',
    !student.consent?.needed && 'Demande terminée',
    clickable &&
      (group === 'pending'
        ? 'Cliquez pour renvoyer un lien'
        : 'Cliquez pour envoyer une demande'),
  ]
    .filter(Boolean)
    .join('. ')
    .concat('.');
  const icon = urgent ? (
    <ReportIcon color="error" fontSize="small" />
  ) : group === 'signed' ? (
    <CheckCircleIcon color="success" fontSize="small" />
  ) : group === 'pending' ? (
    <HourglassTopIcon color="warning" fontSize="small" />
  ) : group === 'missing' ? (
    <ErrorIcon color="error" fontSize="small" />
  ) : (
    <RemoveIcon color="disabled" fontSize="small" />
  );
  return (
    <Tooltip title={title}>
      <span>
        {clickable ? (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onAsk(student);
            }}>
            {icon}
          </IconButton>
        ) : (
          <Stack sx={{ p: '5px' }}>{icon}</Stack>
        )}
      </span>
    </Tooltip>
  );
};

// "Envoyer les demandes par e-mail" for the selected students
export const BulkConsentButton = ({ students, onDone }) => {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const missing = students.filter((s) => consentGroup(s) === 'missing');

  const send = async () => {
    setSending(true);
    try {
      const { data } = await axios.post(`${BASE_URL}/admin/consents/bulk`, {
        ids: missing.map((s) => s.id),
      });
      setResult(data);
      onDone();
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Les demandes n'ont pas pu être envoyées",
        {
          position: 'bottom-left',
        }
      );
    } finally {
      setSending(false);
    }
  };

  // The result stays on screen after the selection is cleared
  return (
    <>
      {students.length > 0 && (
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="body2">
            {students.length} élève{students.length > 1 ? 's' : ''} sélectionné
            {students.length > 1 ? 's' : ''}
          </Typography>
          <Tooltip
            title={
              missing.length
                ? 'Un e-mail avec un lien personnel au responsable qui a une adresse ; ceux qui ont déjà signé ou reçu un lien ne sont pas concernés'
                : "Aucun élève sélectionné n'a l'accord manquant"
            }>
            <span>
              <Button
                size="small"
                variant="contained"
                startIcon={<ForwardToInboxIcon />}
                disabled={!missing.length || sending}
                onClick={send}>
                Demander l'accord par e-mail ({missing.length})
              </Button>
            </span>
          </Tooltip>
        </Stack>
      )}
      <Dialog
        open={!!result}
        onClose={() => setResult(null)}
        maxWidth="sm"
        fullWidth>
        <DialogTitle>Demandes d'accord envoyées</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5}>
            {result?.sent.length > 0 && (
              <Alert severity="success">
                {result.sent.length} e-mail{result.sent.length > 1 ? 's' : ''}{' '}
                envoyé
                {result.sent.length > 1 ? 's' : ''} :{' '}
                {result.sent.map((s) => s.name).join(', ')}.
              </Alert>
            )}
            {result?.no_email.length > 0 && (
              <Alert severity="warning">
                Sans adresse e-mail, à faire par WhatsApp depuis la fiche :{' '}
                {result.no_email.map((s) => s.name).join(', ')}.
              </Alert>
            )}
            {result?.skipped.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                Non concernés (déjà signé ou lien en cours) :{' '}
                {result.skipped.map((s) => s.name).join(', ')}.
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              Sans signature au bout de 7 jours, un rappel part automatiquement
              par e-mail avec un nouveau lien.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResult(null)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// Chips above the list: missing / waiting / signed, and the urgent case
export const ConsentFilterChips = ({ students, value, onChange }) => {
  const count = (v) => students.filter((s) => consentGroup(s) === v).length;
  const urgent = students.filter(pairWithoutConsent).length;
  return (
    <Stack direction="row" flexWrap="wrap" alignItems="center" gap={1}>
      <Tooltip title="Demandes en cours (sauf terminées et abandons)">
        <Typography variant="body2" color="text.secondary">
          Accord des parents :
        </Typography>
      </Tooltip>
      {CONSENT_FILTERS.map((f) => (
        <Chip
          key={f.value}
          size="small"
          color={f.color}
          label={`${f.label} ${count(f.value)}`}
          variant={value === f.value ? 'filled' : 'outlined'}
          onClick={() => onChange(value === f.value ? null : f.value)}
        />
      ))}
      {urgent > 0 && (
        <Tooltip title="Un tuteur est proposé ou actif alors que l'accord des parents manque">
          <Chip
            size="small"
            color="error"
            icon={<ErrorIcon />}
            label={`${urgent} binôme${urgent > 1 ? 's' : ''} sans accord`}
            variant={value === 'urgent' ? 'filled' : 'outlined'}
            onClick={() => onChange(value === 'urgent' ? null : 'urgent')}
          />
        </Tooltip>
      )}
    </Stack>
  );
};

export const matchesConsentFilter = (s, value) =>
  !value ||
  (value === 'urgent' ? pairWithoutConsent(s) : consentGroup(s) === value);
