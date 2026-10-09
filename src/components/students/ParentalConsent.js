import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import DescriptionIcon from '@mui/icons-material/Description';
import { whatsappNumber } from '../../js/whatsapp';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const frDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '');
const parent = (student, n) => ({
  n,
  name: [student[`parent${n}_firstname`], student[`parent${n}_lastname`]]
    .filter(Boolean)
    .join(' '),
  email: student[`parent${n}_email`],
  phone: student[`parent${n}_phone`],
});
const STATE_LABELS = {
  pending: 'en attente',
  signed: 'signé',
  revoked: 'retiré',
  cancelled: 'remplacé ou annulé',
  expired: 'expiré',
  locked: 'bloqué (trop d’essais)',
};
const channelLabel = (c) => (c === 'whatsapp' ? 'WhatsApp' : 'e-mail');

const openFile = async (file) => {
  try {
    const { data } = await axios.post(`${BASE_URL}/students/files/url`, {
      path: file.path,
    });
    window.open(data.url, '_blank', 'noopener');
  } catch {
    toast.error("Le document n'a pas pu être ouvert", { position: 'bottom-left' });
  }
};

// Request dialog: which parent, which channel; then the link to send
export const RequestDialog = ({ student, open, onClose, onSent }) => {
  const parents = [parent(student, 1), parent(student, 2)].filter(
    (p) => p.name || p.email || p.phone
  );
  const [n, setN] = useState(1);
  const [channel, setChannel] = useState('email');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const chosen = parents.find((p) => p.n === n) || parents[0];

  useEffect(() => {
    if (!open) return;
    setResult(null);
    const first = parents[0];
    setN(first?.n || 1);
    setChannel(first?.email ? 'email' : 'whatsapp');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const openWhatsApp = (data) =>
    window.open(
      `https://wa.me/${whatsappNumber(data.phone)}?text=${encodeURIComponent(data.message)}`,
      '_blank',
      'noopener'
    );

  const send = async () => {
    setSending(true);
    try {
      const { data } = await axios.post(
        `${BASE_URL}/admin/students/${student.id}/consents`,
        { parent: chosen.n, channel }
      );
      setResult(data);
      if (channel === 'whatsapp') openWhatsApp(data);
      onSent();
    } catch (err) {
      toast.error(err.response?.data?.error || "La demande n'a pas pu être envoyée", {
        position: 'bottom-left',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Demander l'accord des parents</DialogTitle>
      <DialogContent>
        {result ? (
          <Stack spacing={2}>
            <Alert severity="success">
              {result.channel === 'email'
                ? `E-mail envoyé à ${result.sent_to}.`
                : 'WhatsApp s’est ouvert avec le message prêt : il ne reste qu’à l’envoyer.'}{' '}
              Le lien est valable jusqu'au {frDate(result.expires_at)}.
            </Alert>
            <TextField
              size="small"
              label="Lien personnel du parent"
              value={result.link}
              InputProps={{ readOnly: true }}
              onFocus={(e) => e.target.select()}
            />
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                onClick={() =>
                  navigator.clipboard
                    .writeText(result.link)
                    .then(() => toast.success('Lien copié', { position: 'bottom-left' }))
                }>
                Copier le lien
              </Button>
              {result.channel === 'whatsapp' && (
                <Button size="small" startIcon={<WhatsAppIcon />} onClick={() => openWhatsApp(result)}>
                  Rouvrir WhatsApp
                </Button>
              )}
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Ce lien ne sera plus affiché ensuite. Pour en obtenir un autre,
              faites une nouvelle demande (l'ancien lien ne marchera plus).
            </Typography>
          </Stack>
        ) : parents.length === 0 ? (
          <Alert severity="warning">
            Renseignez d'abord un responsable légal (téléphone ou e-mail) dans
            le bloc « Responsables légaux ».
          </Alert>
        ) : (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <DialogContentText>
              Le parent reçoit un lien personnel, valable 15 jours. Il lit les
              accords, coche, signe au doigt et valide. Le document signé est
              ensuite rangé sur cette fiche.
            </DialogContentText>
            {parents.length > 1 && (
              <Box>
                <FormLabel>Responsable</FormLabel>
                <RadioGroup
                  value={chosen.n}
                  onChange={(e) => {
                    const p = parents.find((x) => x.n === Number(e.target.value));
                    setN(p.n);
                    setChannel(p.email ? 'email' : 'whatsapp');
                  }}>
                  {parents.map((p) => (
                    <FormControlLabel
                      key={p.n}
                      value={p.n}
                      control={<Radio />}
                      label={p.name || `Responsable ${p.n}`}
                    />
                  ))}
                </RadioGroup>
              </Box>
            )}
            <Box>
              <FormLabel>Envoyer par</FormLabel>
              <RadioGroup value={channel} onChange={(e) => setChannel(e.target.value)}>
                <FormControlLabel
                  value="email"
                  disabled={!chosen.email}
                  control={<Radio />}
                  label={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <EmailIcon fontSize="small" />
                      <span>
                        E-mail{chosen.email ? ` (${chosen.email})` : ' : pas d’adresse'}, envoyé
                        par l'application
                      </span>
                    </Stack>
                  }
                />
                <FormControlLabel
                  value="whatsapp"
                  disabled={!whatsappNumber(chosen.phone)}
                  control={<Radio />}
                  label={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <WhatsAppIcon fontSize="small" sx={{ color: '#25D366' }} />
                      <span>
                        WhatsApp
                        {chosen.phone ? ` (${chosen.phone})` : ' : pas de téléphone'}, message
                        prêt à envoyer
                      </span>
                    </Stack>
                  }
                />
              </RadioGroup>
            </Box>
            {!student.birth_date && (
              <Alert severity="info">
                Sans date de naissance de l'élève sur la fiche, le parent n'aura
                pas de vérification à faire. Renseignez-la si possible.
              </Alert>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{result ? 'Fermer' : 'Annuler'}</Button>
        {!result && parents.length > 0 && (
          <Button
            variant="contained"
            disabled={sending || (channel === 'email' ? !chosen.email : !whatsappNumber(chosen.phone))}
            onClick={send}>
            Envoyer
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

// "Accord des parents" block of the student's page
const ParentalConsent = ({ student, canEdit, onConsentChange }) => {
  const [requests, setRequests] = useState([]);
  const [asking, setAsking] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(null);

  const load = useCallback(() => {
    axios
      .get(`${BASE_URL}/admin/students/${student.id}/consents`)
      .then(({ data }) => setRequests(data))
      .catch(() => setRequests([]));
  }, [student.id]);
  useEffect(load, [load]);

  const signed = requests.find((r) => r.state === 'signed');
  const pending = requests.find((r) => r.state === 'pending');
  const paper = !signed && !!student.parental_consent_at;
  const past = requests.filter((r) => r !== signed && r !== pending).slice(0, 5);

  const action = async (r, what) => {
    try {
      await axios.post(`${BASE_URL}/admin/students/${student.id}/consents/${r.id}/${what}`);
      if (what === 'revoke') onConsentChange(null, false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action impossible', { position: 'bottom-left' });
    }
  };

  return (
    <Stack spacing={1.5}>
      {signed ? (
        <Box>
          <Chip
            color="success"
            size="small"
            label={`Accord signé en ligne le ${frDate(signed.signed_at)}`}
          />
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Par {signed.signer_name} ({signed.signer_relation})
            {signed.choices?.image && !signed.choices.image.accepted
              ? ' · pas de droit à l’image'
              : ''}
            {signed.choices?.besoins && !signed.choices.besoins.accepted
              ? ' · besoins particuliers non autorisés'
              : ''}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
            {signed.file && (
              <Button size="small" startIcon={<DescriptionIcon />} onClick={() => openFile(signed.file)}>
                Voir le document
              </Button>
            )}
            {canEdit && (
              <Button size="small" color="error" onClick={() => setConfirmRevoke(signed)}>
                Retirer l'accord
              </Button>
            )}
          </Stack>
        </Box>
      ) : paper ? (
        <Chip
          size="small"
          color="success"
          variant="outlined"
          label={`Accord reçu hors ligne le ${frDate(student.parental_consent_at)}`}
          sx={{ alignSelf: 'flex-start' }}
        />
      ) : (
        <Chip size="small" label="Pas encore d'accord" sx={{ alignSelf: 'flex-start' }} />
      )}

      {pending && (
        <Alert
          severity="info"
          action={
            canEdit && (
              <Button size="small" color="inherit" onClick={() => action(pending, 'cancel')}>
                Annuler
              </Button>
            )
          }>
          Lien envoyé le {frDate(pending.requested_at)} par {channelLabel(pending.channel)}
          {pending.sent_to ? ` (${pending.sent_to})` : ''}, en attente de signature
          jusqu'au {frDate(pending.expires_at)}.
        </Alert>
      )}

      {canEdit && !signed && (
        <Button
          variant="outlined"
          size="small"
          sx={{ alignSelf: 'flex-start' }}
          onClick={() => setAsking(true)}>
          {pending ? 'Renvoyer un nouveau lien' : "Demander l'accord en ligne"}
        </Button>
      )}

      {!signed && (
        <FormControlLabel
          disabled={!canEdit}
          control={
            <Checkbox
              size="small"
              checked={paper}
              onChange={(e) =>
                onConsentChange(e.target.checked ? new Date().toISOString() : null, true)
              }
            />
          }
          label={<Typography variant="body2">Accord reçu sur papier</Typography>}
        />
      )}

      {past.length > 0 && (
        <Box>
          <Typography variant="caption" color="text.secondary">
            Historique
          </Typography>
          {past.map((r) => (
            <Typography key={r.id} variant="caption" component="div" color="text.secondary">
              {frDate(r.requested_at)} · {channelLabel(r.channel)} · {STATE_LABELS[r.state]}
              {r.state === 'revoked' && r.file && (
                <Button size="small" sx={{ ml: 1, py: 0 }} onClick={() => openFile(r.file)}>
                  document
                </Button>
              )}
            </Typography>
          ))}
        </Box>
      )}

      <RequestDialog
        student={student}
        open={asking}
        onClose={() => setAsking(false)}
        onSent={load}
      />

      <Dialog open={!!confirmRevoke} onClose={() => setConfirmRevoke(null)}>
        <DialogTitle>Retirer l'accord des parents ?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            À faire quand le parent vous a demandé de retirer son accord. Le
            document signé reste conservé dans l'historique.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmRevoke(null)}>Annuler</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              action(confirmRevoke, 'revoke');
              setConfirmRevoke(null);
            }}>
            Retirer
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default ParentalConsent;
