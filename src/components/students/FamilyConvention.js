import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import VisibilityIcon from '@mui/icons-material/Visibility';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const ok = (t) => toast.success(t, { position: 'bottom-left' });
const ko = (err, t) =>
  toast.error(err?.response?.data?.error || t, { position: 'bottom-left' });
const frDay = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '');
const readFile = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
// A PDF answer (arraybuffer) opened in a new tab
const openBlob = (data) => {
  const url = URL.createObjectURL(
    new Blob([data], { type: 'application/pdf' })
  );
  window.open(url, '_blank');
};

// Family convention of the year: sent at registration to one legal
// guardian, signed online, countersigned automatically; or a paper one
const FamilyConvention = ({ studentId, canEdit }) => {
  const [data, setData] = useState(null);
  const [team, setTeam] = useState(null);
  const [to, setTo] = useState({ parent: 1, channel: 'email' });
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  // reset: the amounts computed again (the QF may have changed meanwhile)
  const load = useCallback(
    (reset = false) => {
      axios
        .get(`${BASE_URL}/admin/students/${studentId}/conventions-famille`)
        .then(({ data }) => {
          setData(data);
          setTeam((t) => (reset === true || !t ? data.defaults : t));
          const p = data.parents[0];
          if (p)
            setTo({ parent: p.n, channel: p.has_email ? 'email' : 'whatsapp' });
        })
        .catch(() => setData({ conventions: [], parents: [], defaults: {} }));
    },
    [studentId]
  );
  useEffect(() => load(), [load]);
  if (!data || !team) return null;

  const current = data.conventions.find((c) =>
    ['signée', 'papier'].includes(c.state)
  );
  const pending = data.conventions.find((c) => c.state === 'envoyée');
  const parent = data.parents.find((p) => p.n === Number(to.parent));
  const set = (k) => (e) => setTeam((t) => ({ ...t, [k]: e.target.value }));
  const run = async (fn) => {
    setBusy(true);
    try {
      return await fn();
    } finally {
      setBusy(false);
    }
  };
  const preview = () =>
    run(async () => {
      try {
        const { data: pdf } = await axios.post(
          `${BASE_URL}/admin/students/${studentId}/conventions-famille/apercu`,
          team,
          { responseType: 'arraybuffer' }
        );
        openBlob(pdf);
      } catch (err) {
        ko(err, 'Aperçu impossible');
      }
    });
  const send = () =>
    run(async () => {
      try {
        const { data: r } = await axios.post(
          `${BASE_URL}/admin/students/${studentId}/conventions-famille`,
          { channel: to.channel, parent: to.parent, team }
        );
        if (to.channel === 'email') ok(`Convention envoyée à ${r.sent_to}`);
        else {
          try {
            await navigator.clipboard.writeText(r.whatsapp);
            ok('Message copié : collez-le dans WhatsApp');
          } catch {
            window.prompt('Message à copier dans WhatsApp', r.whatsapp);
          }
        }
        setOpen(false);
        load();
      } catch (err) {
        ko(err, "La convention n'a pas pu être envoyée");
      }
    });
  const cancel = (c) =>
    run(async () => {
      try {
        await axios.post(
          `${BASE_URL}/admin/conventions-famille/${c.id}/annuler`
        );
        load();
      } catch (err) {
        ko(err, "L'annulation n'a pas pu être enregistrée");
      }
    });
  const paper = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    run(async () => {
      try {
        await axios.post(
          `${BASE_URL}/admin/students/${studentId}/conventions-famille/papier`,
          { file: await readFile(file), name: file.name }
        );
        ok('Convention papier enregistrée');
        load();
      } catch (err) {
        ko(err, "La convention n'a pas pu être enregistrée");
      }
    });
  };
  const pdf = async (c) => {
    try {
      const { data: r } = await axios.get(
        `${BASE_URL}/admin/conventions-famille/${c.id}/pdf`
      );
      window.open(r.url, '_blank');
    } catch (err) {
      ko(err, 'Document indisponible');
    }
  };

  return (
    <Stack spacing={1.5}>
      {current ? (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap>
          <Chip
            color="success"
            label={
              current.state === 'papier'
                ? `${current.school_year} : convention papier déposée le ${frDay(current.signed_at)}`
                : `${current.school_year} : signée le ${frDay(current.signed_at)} par ${current.signer_name}`
            }
          />
          <Button
            size="small"
            startIcon={<PictureAsPdfIcon />}
            onClick={() => pdf(current)}>
            Voir
          </Button>
        </Stack>
      ) : pending ? (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap>
          <Chip
            color="info"
            variant="outlined"
            label={`Envoyée le ${frDay(pending.requested_at)} ${
              pending.channel === 'email'
                ? `à ${pending.sent_to}`
                : 'par WhatsApp'
            }, en attente (lien valable jusqu'au ${frDay(pending.expires_at)})`}
            sx={{
              height: 'auto',
              '& .MuiChip-label': { whiteSpace: 'normal', py: 0.5 },
            }}
          />
          {canEdit && (
            <Button
              size="small"
              color="inherit"
              disabled={busy}
              onClick={() => cancel(pending)}>
              Annuler
            </Button>
          )}
        </Stack>
      ) : (
        <Chip
          color="warning"
          variant="outlined"
          label="Pas encore envoyée"
          sx={{ alignSelf: 'flex-start' }}
        />
      )}

      {canEdit && !current && (
        <>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              size="small"
              variant={open ? 'outlined' : 'contained'}
              startIcon={<SendIcon />}
              onClick={() => {
                if (!open) load(true);
                setOpen((o) => !o);
              }}>
              {pending ? 'Renvoyer (nouveau lien)' : 'Préparer et envoyer'}
            </Button>
            <Button
              size="small"
              component="label"
              startIcon={<UploadFileIcon />}
              disabled={busy}>
              Déposer une convention papier
              <input
                hidden
                type="file"
                accept="application/pdf,image/*"
                onChange={paper}
              />
            </Button>
          </Stack>
          <Collapse in={open}>
            <Box
              sx={{
                display: 'grid',
                gap: 1.5,
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                pt: 1,
              }}>
              <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                  Participation aux frais
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  size="small"
                  value={team.participation_mode}
                  onChange={(e, v) =>
                    v && setTeam((t) => ({ ...t, participation_mode: v }))
                  }>
                  <ToggleButton value="trimestre">Par trimestre</ToggleButton>
                  <ToggleButton value="annee">Pour l'année</ToggleButton>
                  <ToggleButton value="horaire">Tarif horaire</ToggleButton>
                </ToggleButtonGroup>
              </Box>
              {data.defaults.source ? (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ gridColumn: { sm: '1 / -1' } }}>
                  Calcul automatique : {data.defaults.source}. Modifiez
                  seulement pour un cas particulier.
                </Typography>
              ) : (
                <Alert severity="warning" sx={{ gridColumn: { sm: '1 / -1' } }}>
                  QF non renseigné : saisissez le quotient familial sur la fiche
                  (bloc « Participation aux frais ») pour calculer la
                  participation et la caution, ou indiquez-les ici.
                </Alert>
              )}
              {team.participation_mode === 'trimestre' && (
                <TextField
                  size="small"
                  type="number"
                  label="Montant par trimestre (€)"
                  value={team.montant_trimestre ?? ''}
                  onChange={set('montant_trimestre')}
                />
              )}
              {team.participation_mode === 'annee' && (
                <TextField
                  size="small"
                  type="number"
                  label="Montant pour l'année (€)"
                  value={team.montant_annee ?? ''}
                  onChange={set('montant_annee')}
                />
              )}
              {team.participation_mode === 'horaire' && (
                <TextField
                  size="small"
                  label="Tarif horaire"
                  placeholder="45 € par heure (5 heures : 200 €)"
                  value={team.tarif_horaire || ''}
                  onChange={set('tarif_horaire')}
                  helperText="Écrit après « autre : »"
                />
              )}
              <TextField
                size="small"
                type="number"
                label="Caution (€)"
                value={team.caution_montant ?? ''}
                onChange={set('caution_montant')}
              />
              <TextField
                size="small"
                label="Autre (type d'aide)"
                placeholder="Ex. : aide aux devoirs"
                value={team.autre_texte || ''}
                onChange={set('autre_texte')}
                sx={{ gridColumn: { sm: '1 / -1' } }}
              />
              <TextField
                size="small"
                label="Obligations spécifiques (facultatif)"
                value={team.obligations || ''}
                onChange={set('obligations')}
                multiline
                minRows={2}
                sx={{ gridColumn: { sm: '1 / -1' } }}
              />
              {data.parents.length ? (
                <>
                  <TextField
                    select
                    size="small"
                    label="Envoyer à"
                    value={to.parent}
                    onChange={(e) => {
                      const p = data.parents.find(
                        (x) => x.n === Number(e.target.value)
                      );
                      setTo({
                        parent: p.n,
                        channel: p.has_email ? 'email' : 'whatsapp',
                      });
                    }}>
                    {data.parents.map((p) => (
                      <MenuItem key={p.n} value={p.n}>
                        {p.name || `Parent ${p.n}`}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    size="small"
                    label="Par"
                    value={to.channel}
                    onChange={(e) =>
                      setTo((x) => ({ ...x, channel: e.target.value }))
                    }>
                    <MenuItem value="email" disabled={!parent?.has_email}>
                      E-mail
                    </MenuItem>
                    <MenuItem value="whatsapp" disabled={!parent?.has_phone}>
                      WhatsApp (message à copier)
                    </MenuItem>
                  </TextField>
                </>
              ) : (
                <Alert severity="warning" sx={{ gridColumn: { sm: '1 / -1' } }}>
                  Aucun e-mail ni téléphone de parent sur la fiche : complétez
                  le bloc « Famille ».
                </Alert>
              )}
              <Stack
                direction="row"
                spacing={1}
                sx={{ gridColumn: { sm: '1 / -1' } }}>
                <Button
                  size="small"
                  startIcon={<VisibilityIcon />}
                  disabled={busy}
                  onClick={preview}>
                  Aperçu
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<SendIcon />}
                  disabled={busy || !data.parents.length}
                  onClick={send}>
                  Envoyer
                </Button>
              </Stack>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ gridColumn: { sm: '1 / -1' } }}>
                Le reste vient de la fiche élève (classe, établissement, QF,
                modalité, lieux, créneaux). Le parent complète son adresse et
                ses choix, signe ; la présidente contresigne automatiquement et
                le PDF est rangé dans les documents de l'élève.
              </Typography>
            </Box>
          </Collapse>
        </>
      )}
      {data.conventions.filter((c) => c !== current && c !== pending).length >
        0 && (
        <Typography variant="caption" color="text.secondary">
          Historique :{' '}
          {data.conventions
            .filter((c) => c !== current && c !== pending)
            .map(
              (c) => `${c.school_year} ${c.state} (${frDay(c.requested_at)})`
            )
            .join(' · ')}
        </Typography>
      )}
    </Stack>
  );
};

export default FamilyConvention;
