import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EmailIcon from '@mui/icons-material/Email';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import {
  ATTENDANCES,
  BASE_URL,
  CONSENT_STATES,
  PAYMENT_METHODS,
  WAYS,
  euros,
  today,
} from './activityUtils';

const toastError = (err, text) =>
  toast.error(err.response?.data?.error || text, { position: 'bottom-left' });
const ok = (text) => toast.success(text, { position: 'bottom-left' });

const Part = ({ title, children }) => (
  <Box>
    <Typography fontWeight={600} sx={{ mb: 1 }}>
      {title}
    </Typography>
    {children}
  </Box>
);

// One registered child: authorisation, membership, participation, how the
// child comes and leaves, presences
const RegistrationDialog = ({ r, a, canEdit, onPay, onClose, onChanged }) => {
  const [busy, setBusy] = useState(false);
  const [ways, setWays] = useState({
    arrival: r.arrival || '',
    departure: r.departure || '',
    emergency_phone: r.emergency_phone || '',
  });
  const [member, setMember] = useState({
    amount: 10,
    method: 'espèces',
    paid_at: today(),
  });
  const run = async (fn, done, fail) => {
    setBusy(true);
    try {
      const out = await fn();
      if (done) ok(done);
      onChanged();
      return out;
    } catch (err) {
      toastError(err, fail);
      return null;
    } finally {
      setBusy(false);
    }
  };
  const patch = (body, done) =>
    run(
      () =>
        axios.patch(`${BASE_URL}/admin/inscriptions-activites/${r.id}`, body),
      done,
      "L'inscription n'a pas pu être modifiée"
    );
  const askConsent = async (channel, parent) => {
    const out = await run(
      () =>
        axios.post(
          `${BASE_URL}/admin/inscriptions-activites/${r.id}/autorisation`,
          {
            channel,
            parent,
          }
        ),
      null,
      "La demande n'a pas pu être envoyée"
    );
    if (!out) return;
    if (channel === 'email') ok(`Lien envoyé à ${out.data.sent_to}`);
    else {
      try {
        await navigator.clipboard.writeText(out.data.whatsapp);
        ok('Message copié : collez-le dans WhatsApp');
      } catch {
        window.prompt('Message à copier', out.data.whatsapp);
      }
    }
  };
  const openPdf = async () => {
    try {
      const { data } = await axios.get(
        `${BASE_URL}/admin/inscriptions-activites/${r.id}/autorisation-pdf`
      );
      window.open(data.url, '_blank');
    } catch (err) {
      toastError(err, 'Document indisponible');
    }
  };
  const consent =
    CONSENT_STATES[r.consent_state] || CONSENT_STATES['à demander'];
  const presence = (field, label) => (
    <TextField
      select
      size="small"
      label={label}
      value={r[field] || ''}
      disabled={!canEdit || busy}
      onChange={(e) => patch({ [field]: e.target.value || null })}
      sx={{ minWidth: 150 }}>
      <MenuItem value="">—</MenuItem>
      {ATTENDANCES.map((x) => (
        <MenuItem key={x.value} value={x.value}>
          {x.label}
        </MenuItem>
      ))}
    </TextField>
  );

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {r.first_name} {r.last_name}
        <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
          <Chip size="small" variant="outlined" label={r.kind} />
          {r.level && <Chip size="small" variant="outlined" label={r.level} />}
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} divider={<Divider />}>
          <Part title="Autorisation de sortie">
            <Stack spacing={1}>
              <Chip
                size="small"
                color={consent.color}
                label={consent.label}
                sx={{ alignSelf: 'flex-start' }}
              />
              {r.consent_state === 'signée' && (
                <Typography variant="body2" color="text.secondary">
                  Par {r.consent_signer} ({r.consent_relation}), le{' '}
                  {new Date(`${r.consent_at}T12:00:00Z`).toLocaleDateString(
                    'fr-FR'
                  )}
                  {r.consent_choices && !r.consent_choices.photos
                    ? ' · photos refusées'
                    : ''}
                </Typography>
              )}
              {r.consent_state === 'demandée' && (
                <Typography variant="body2" color="text.secondary">
                  Lien envoyé le{' '}
                  {new Date(r.consent_requested_at).toLocaleDateString('fr-FR')}
                  {r.consent_channel === 'email'
                    ? ` à ${r.consent_sent_to}`
                    : ' par WhatsApp'}
                  .
                </Typography>
              )}
              {canEdit && !r.consent_at && (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {[1, 2].map((n) =>
                    r[`parent${n}_has_email`] ? (
                      <Button
                        key={n}
                        size="small"
                        variant="outlined"
                        startIcon={<EmailIcon />}
                        disabled={busy}
                        onClick={() => askConsent('email', n)}>
                        E-mail{' '}
                        {r[`parent${n}_firstname`]
                          ? `à ${r[`parent${n}_firstname`]}`
                          : `au parent ${n}`}
                      </Button>
                    ) : null
                  )}
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ContentCopyIcon />}
                    disabled={busy}
                    onClick={() => askConsent('whatsapp', 1)}>
                    Message WhatsApp avec le lien
                  </Button>
                </Stack>
              )}
              {r.consent_state === 'signée' && (
                <Button
                  size="small"
                  startIcon={<PictureAsPdfIcon />}
                  onClick={openPdf}
                  sx={{ alignSelf: 'flex-start' }}>
                  Voir l'autorisation signée
                </Button>
              )}
              {canEdit && r.consent_state !== 'signée' && (
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={!!r.consent_at}
                      disabled={busy}
                      onChange={(e) =>
                        patch({ consent_at: e.target.checked ? today() : null })
                      }
                    />
                  }
                  label={
                    <Typography variant="body2">Reçue sur papier</Typography>
                  }
                />
              )}
            </Stack>
          </Part>

          <Part title={`Cotisation ${a.school_year}`}>
            {r.membership ? (
              <Chip
                size="small"
                color="success"
                label={`À jour${r.membership.paid_at ? `, payée le ${new Date(`${r.membership.paid_at}T12:00:00Z`).toLocaleDateString('fr-FR')}` : ''}`}
              />
            ) : (
              <Stack spacing={1}>
                <Typography variant="body2" color="warning.dark">
                  Pas encore payée : un enfant qui participe doit être adhérent.
                </Typography>
                {canEdit && (
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <TextField
                      size="small"
                      type="number"
                      label="Montant (€)"
                      value={member.amount}
                      onChange={(e) =>
                        setMember({ ...member, amount: e.target.value })
                      }
                      sx={{ width: 120 }}
                    />
                    <TextField
                      select
                      size="small"
                      label="Moyen"
                      value={member.method}
                      onChange={(e) =>
                        setMember({ ...member, method: e.target.value })
                      }
                      sx={{ minWidth: 130 }}>
                      {PAYMENT_METHODS.map((m) => (
                        <MenuItem key={m.value} value={m.value}>
                          {m.label}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      size="small"
                      type="date"
                      label="Payée le"
                      value={member.paid_at}
                      onChange={(e) =>
                        setMember({ ...member, paid_at: e.target.value })
                      }
                      InputLabelProps={{ shrink: true }}
                    />
                    <Button
                      variant="outlined"
                      disabled={busy}
                      onClick={() =>
                        run(
                          () =>
                            axios.post(
                              `${BASE_URL}/admin/students/${r.student_id}/cotisations`,
                              { ...member, school_year: a.school_year }
                            ),
                          'Cotisation enregistrée',
                          "La cotisation n'a pas pu être enregistrée"
                        )
                      }>
                      Enregistrer
                    </Button>
                  </Stack>
                )}
              </Stack>
            )}
          </Part>

          <Part title="Participation à la sortie">
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2">
                {r.due > 0
                  ? r.paid_amount !== null && r.paid_amount !== undefined
                    ? `Payé ${euros(r.paid_amount)} sur ${euros(r.due)}`
                    : `${euros(r.due)} à payer`
                  : 'Gratuit'}
              </Typography>
              {canEdit && (
                <Button size="small" onClick={onPay}>
                  Paiement
                </Button>
              )}
            </Stack>
          </Part>

          <Part title="Arrivée et départ">
            <Stack spacing={1.5}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <TextField
                  select
                  size="small"
                  label="Vient au rendez-vous"
                  value={ways.arrival}
                  onChange={(e) =>
                    setWays({ ...ways, arrival: e.target.value })
                  }
                  disabled={!canEdit}
                  sx={{ minWidth: 190 }}>
                  <MenuItem value="">—</MenuItem>
                  {WAYS.map((w) => (
                    <MenuItem key={w.value} value={w.value}>
                      {w.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  size="small"
                  label="Repart"
                  value={ways.departure}
                  onChange={(e) =>
                    setWays({ ...ways, departure: e.target.value })
                  }
                  disabled={!canEdit}
                  sx={{ minWidth: 190 }}>
                  <MenuItem value="">—</MenuItem>
                  {WAYS.map((w) => (
                    <MenuItem key={w.value} value={w.value}>
                      {w.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
              <TextField
                size="small"
                label="Téléphone joignable pendant la sortie"
                value={ways.emergency_phone}
                onChange={(e) =>
                  setWays({ ...ways, emergency_phone: e.target.value })
                }
                disabled={!canEdit}
              />
              {canEdit && (
                <Button
                  size="small"
                  variant="outlined"
                  sx={{ alignSelf: 'flex-start' }}
                  disabled={busy}
                  onClick={() => patch(ways, 'Enregistré')}>
                  Enregistrer
                </Button>
              )}
              <Typography variant="caption" color="text.secondary">
                Rempli par le parent quand il signe l'autorisation en ligne.
              </Typography>
            </Stack>
          </Part>

          <Part title="Présences">
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              {a.prep?.date && presence('attendance_prep', 'Préparation')}
              {presence('attendance', 'Sortie')}
              {a.debrief?.date && presence('attendance_post', 'Retour')}
            </Stack>
            {r.attendance_by && r.attendance_by !== 'équipe' && (
              <Typography variant="caption" color="text.secondary">
                Présence à la sortie cochée par {r.attendance_by}.
              </Typography>
            )}
          </Part>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RegistrationDialog;
