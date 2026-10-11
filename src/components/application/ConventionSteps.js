import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VerifiedIcon from '@mui/icons-material/Verified';
import DrawIcon from '@mui/icons-material/Draw';
import MenuBookIcon from '@mui/icons-material/MenuBook';

import FileDisplay from '../FileDisplay';
import SignaturePad from './SignaturePad';
import {
  notifyApplicationChanged,
  useApplicationProgress,
} from '../../js/applicationProgress';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const formatDate = (value) => new Date(value).toLocaleDateString('fr-FR');
const formatDateTime = (value) =>
  new Date(value).toLocaleString('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
const errorText = (err, fallback) => err.response?.data?.error || fallback;

const StepIcon = ({ state }) =>
  state === 'done' ? (
    <CheckCircleIcon color="success" />
  ) : state === 'waiting' ? (
    <HourglassTopIcon color="warning" />
  ) : (
    <RadioButtonUncheckedIcon color="action" />
  );

const Step = ({ number, title, state, children }) => (
  <Paper variant="outlined" sx={{ p: 2 }}>
    <Stack direction="row" spacing={1.5} alignItems="flex-start">
      <StepIcon state={state} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography fontWeight={600}>
          {number}. {title}
        </Typography>
        <Box sx={{ mt: 1 }}>{children}</Box>
      </Box>
    </Stack>
  </Paper>
);

// Hidden file input opened by a button; uploads to the convention route
// (paper conventions)
const UploadButton = ({ userId, type, label, variant = 'contained' }) => {
  const input = useRef(null);
  const [uploading, setUploading] = useState(false);
  const upload = async (event) => {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      await axios.post(`${BASE_URL}/upload/convention/${userId}`, formData, {
        params: type ? { type } : undefined,
      });
      toast.success('Convention déposée', { position: 'bottom-left' });
      notifyApplicationChanged();
    } catch (err) {
      toast.error("La convention n'a pas pu être déposée", {
        position: 'bottom-left',
      });
    } finally {
      setUploading(false);
    }
  };
  return (
    <>
      <input
        ref={input}
        type="file"
        hidden
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={upload}
      />
      <Button
        variant={variant}
        size="small"
        disabled={uploading}
        startIcon={
          uploading ? <CircularProgress size={16} /> : <UploadFileIcon />
        }
        onClick={() => input.current.click()}>
        {label}
      </Button>
    </>
  );
};

const FileLine = ({ file, label, onView }) => (
  <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
    <Chip
      size="small"
      color="success"
      icon={<CheckCircleIcon />}
      label={`${label} le ${formatDate(file.uploaded_at)}`}
    />
    <Button
      size="small"
      startIcon={<VisibilityIcon />}
      onClick={() => onView(file.path)}>
      Voir
    </Button>
  </Stack>
);

// PDF shown in a window, with a link to open it in a new tab (phones)
const PdfDialog = ({ title, url, onClose }) => (
  <Dialog open={!!url} onClose={onClose} fullWidth maxWidth="md">
    <DialogTitle>{title}</DialogTitle>
    <DialogContent sx={{ height: '75vh', p: 0 }}>
      {url && (
        <Box
          component="iframe"
          title={title}
          src={url}
          sx={{ width: '100%', height: '100%', border: 0 }}
        />
      )}
    </DialogContent>
    <DialogActions>
      <Button href={url || undefined} target="_blank" rel="noopener">
        Ouvrir dans un nouvel onglet
      </Button>
      <Button variant="contained" onClick={onClose}>
        Fermer
      </Button>
    </DialogActions>
  </Dialog>
);

// Convention filled in with the volunteer's data (not signed yet)
const usePreview = (userId) => {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const open = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${BASE_URL}/users/${userId}/convention/preview`,
        { responseType: 'blob' }
      );
      setUrl(URL.createObjectURL(data));
    } catch (err) {
      let message = "L'aperçu n'a pas pu être créé";
      try {
        message = JSON.parse(await err.response.data.text()).error || message;
      } catch {}
      toast.error(message, { position: 'bottom-left' });
    } finally {
      setLoading(false);
    }
  };
  const close = () => {
    if (url) URL.revokeObjectURL(url);
    setUrl(null);
  };
  return { url, loading, open, close };
};

// Team: end date and "autre" mission written in the convention
const TeamFields = ({ userId, signing, onSaved, locked }) => {
  const [end, setEnd] = useState(signing.convention_end_date || '');
  const [other, setOther] = useState(signing.convention_other || '');
  const save = async (changes) => {
    try {
      await axios.patch(
        `${BASE_URL}/admin/users/${userId}/convention-fields`,
        changes
      );
      onSaved();
    } catch (err) {
      toast.error(errorText(err, 'Enregistrement impossible'), {
        position: 'bottom-left',
      });
    }
  };
  return (
    <Stack spacing={1.5}>
      <TextField
        size="small"
        type="date"
        label="Date de fin envisagée"
        disabled={locked}
        InputLabelProps={{ shrink: true }}
        value={end}
        onChange={(e) => {
          setEnd(e.target.value);
          save({ convention_end_date: e.target.value || null });
        }}
      />
      <TextField
        size="small"
        label="Autre mission (facultatif)"
        disabled={locked}
        placeholder="Ex. : animation d'un atelier informatique"
        value={other}
        onChange={(e) => setOther(e.target.value)}
        onBlur={() => save({ convention_other: other })}
        inputProps={{ maxLength: 200 }}
      />
      {locked && (
        <Typography variant="caption" color="text.secondary">
          Convention déjà signée : ces informations ne peuvent plus changer.
        </Typography>
      )}
    </Stack>
  );
};

// The president signs once; her signature is then added with one click
const CountersignButton = ({ userId, onDone }) => {
  const [drawing, setDrawing] = useState(false);
  const [signature, setSignature] = useState(null);
  const [busy, setBusy] = useState(false);
  const countersign = async () => {
    setBusy(true);
    try {
      await axios.post(
        `${BASE_URL}/admin/users/${userId}/convention/countersign`
      );
      toast.success('Convention contresignée', { position: 'bottom-left' });
      notifyApplicationChanged();
      onDone();
    } catch (err) {
      if (err.response?.data?.code === 'no_signature') setDrawing(true);
      else
        toast.error(
          errorText(err, 'La convention n’a pas pu être contresignée'),
          {
            position: 'bottom-left',
          }
        );
    } finally {
      setBusy(false);
    }
  };
  const saveAndSign = async () => {
    setBusy(true);
    try {
      await axios.put(`${BASE_URL}/admin/president-signature`, { signature });
      setDrawing(false);
      await countersign();
    } catch (err) {
      toast.error(errorText(err, "La signature n'a pas pu être enregistrée"), {
        position: 'bottom-left',
      });
      setBusy(false);
    }
  };
  return (
    <>
      <Button
        variant="contained"
        size="small"
        startIcon={
          busy ? <CircularProgress size={16} color="inherit" /> : <DrawIcon />
        }
        disabled={busy}
        onClick={countersign}>
        Contresigner
      </Button>
      <Dialog
        open={drawing}
        onClose={() => setDrawing(false)}
        fullWidth
        maxWidth="sm">
        <DialogTitle>Votre signature</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            À faire une seule fois : votre signature est conservée de façon
            privée et ajoutée aux conventions que vous contresignez, à chaque
            fois sur votre demande.
          </Typography>
          <SignaturePad onChange={setSignature} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDrawing(false)}>Annuler</Button>
          <Button
            variant="contained"
            disabled={!signature || busy}
            onClick={saveAndSign}>
            Enregistrer et contresigner
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// Convention d'engagement: read the Charte, check the convention filled in
// with one's data, sign it; then the president countersigns it. admin: the
// team's view (fields, countersignature, paper fallback, validation).
const ConventionSteps = ({ userId, admin = false, onValidate }) => {
  const [progress] = useApplicationProgress(userId);
  const [signing, setSigning] = useState(undefined);
  const [charte, setCharte] = useState(undefined);
  const [showCharte, setShowCharte] = useState(false);
  const [view, setView] = useState(null);
  const [consents, setConsents] = useState({
    utilisation: false,
    conservation: false,
  });
  const [signature, setSignature] = useState(null);
  const [busy, setBusy] = useState(false);
  const preview = usePreview(userId);

  const load = useCallback(() => {
    axios
      .get(`${BASE_URL}/users/${userId}/convention/signing`)
      .then(({ data }) => setSigning(data))
      .catch(() => setSigning(null));
  }, [userId]);
  useEffect(() => {
    load();
    axios
      .get(`${BASE_URL}/convention/charte`)
      .then(({ data }) => setCharte(data.charte))
      .catch(() => setCharte(null));
  }, [load]);
  // A convention uploaded or countersigned elsewhere changes the steps
  useEffect(() => {
    window.addEventListener('application-changed', load);
    return () => window.removeEventListener('application-changed', load);
  }, [load]);

  if (!progress?.convention || signing === undefined) {
    return <CircularProgress size={24} />;
  }
  const { convention, documents } = progress;
  const signedFile = convention.signed;
  const complete = convention.state === 'complete';
  const docsOk = documents.cv && documents.id && documents.b3;
  const toSign = signing?.status === 'A finaliser';
  const charteRead = !!signing?.charte_read_at && !signing?.charte_outdated;
  const onlineSigned = signing?.volunteer_signed;

  const readCharte = async (checked) => {
    if (!checked) return;
    try {
      await axios.post(`${BASE_URL}/users/${userId}/convention/charte-read`);
      load();
    } catch (err) {
      toast.error(errorText(err, 'Enregistrement impossible'), {
        position: 'bottom-left',
      });
    }
  };
  const sign = async () => {
    setBusy(true);
    try {
      await axios.post(`${BASE_URL}/users/${userId}/convention/sign`, {
        consents,
        signature,
      });
      toast.success('Convention signée, merci !', { position: 'bottom-left' });
      notifyApplicationChanged();
      load();
    } catch (err) {
      toast.error(errorText(err, "La convention n'a pas pu être signée"), {
        position: 'bottom-left',
      });
    } finally {
      setBusy(false);
    }
  };

  const values = signing?.values || {};
  const charteStep = (
    <Step
      number={1}
      title="Lire la Charte de bénévolat"
      state={charteRead || signedFile || complete ? 'done' : 'todo'}>
      {charte ? (
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              size="small"
              variant={charteRead ? 'text' : 'contained'}
              startIcon={<MenuBookIcon />}
              onClick={() => setShowCharte(true)}>
              Lire la Charte
            </Button>
            <Button
              size="small"
              startIcon={<CloudDownloadIcon />}
              href={charte.url}>
              Télécharger
            </Button>
          </Stack>
          {admin ? (
            <Typography variant="body2" color="text.secondary">
              {signing?.charte_read_at
                ? `Lue le ${formatDateTime(signing.charte_read_at)}${
                    signing.charte_outdated ? ' (version précédente)' : ''
                  }`
                : 'Pas encore lue par le bénévole.'}
            </Typography>
          ) : charteRead ? (
            <Typography variant="body2" color="text.secondary">
              Lue le {formatDateTime(signing.charte_read_at)}.
            </Typography>
          ) : (
            <FormControlLabel
              disabled={!toSign}
              control={
                <Checkbox onChange={(e) => readCharte(e.target.checked)} />
              }
              label={
                signing?.charte_outdated
                  ? "J'ai lu la nouvelle version de la Charte de bénévolat"
                  : "J'ai lu la Charte de bénévolat"
              }
            />
          )}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">
          {charte === null
            ? 'La Charte sera bientôt disponible ici.'
            : 'Chargement…'}
        </Typography>
      )}
    </Step>
  );

  const reviewStep = (
    <Step
      number={2}
      title={admin ? 'Convention pré-remplie' : 'Vérifier ma convention'}
      state={signedFile || complete ? 'done' : 'todo'}>
      {signing?.template_available ? (
        <Stack spacing={1}>
          <Typography variant="body2" component="div">
            Elle est remplie avec{' '}
            {admin ? 'les informations du bénévole' : 'vos informations'} :
            <ul style={{ margin: '4px 0' }}>
              <li>
                {[
                  values.presentiel && 'tutorat en présentiel',
                  values.distanciel && 'tutorat en distanciel',
                ]
                  .filter(Boolean)
                  .join(' et ') || 'modalité à préciser'}
                {values.autre_texte ? `, ${values.autre_texte}` : ''}
              </li>
              <li>Lieu : {values.lieu || 'à préciser'}</li>
              <li>Horaire : {values.horaire || 'à préciser'}</li>
              <li>Date de fin envisagée : {values.date_fin}</li>
            </ul>
          </Typography>
          {!admin && (
            <Typography variant="caption" color="text.secondary">
              Une erreur sur le lieu ou les horaires ? Corrigez l'onglet « Mes
              disponibilités » : la convention se met à jour.
            </Typography>
          )}
          <Box>
            <Button
              size="small"
              startIcon={
                preview.loading ? (
                  <CircularProgress size={16} />
                ) : (
                  <VisibilityIcon />
                )
              }
              disabled={preview.loading}
              onClick={preview.open}>
              Voir la convention
            </Button>
          </Box>
          {admin && (
            <TeamFields
              userId={userId}
              signing={signing}
              onSaved={load}
              locked={!!signedFile || complete}
            />
          )}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Le modèle de convention n'a pas encore été déposé par l'association.
        </Typography>
      )}
    </Step>
  );

  const signStep = (
    <Step
      number={3}
      title={admin ? 'Signature du bénévole' : 'Signer ma convention'}
      state={signedFile || complete ? 'done' : 'todo'}>
      {signedFile ? (
        <Stack spacing={0.5}>
          <FileLine
            file={signedFile}
            label={onlineSigned ? 'Signée en ligne' : 'Déposée'}
            onView={setView}
          />
          {onlineSigned && (
            <Typography variant="caption" color="text.secondary">
              Le {formatDateTime(onlineSigned.signed_at)}
            </Typography>
          )}
        </Stack>
      ) : complete ? (
        <Typography variant="body2" color="text.secondary">
          Convention reçue par l'association.
        </Typography>
      ) : admin ? (
        <Typography variant="body2" color="text.secondary">
          {toSign
            ? 'Pas encore signée par le bénévole.'
            : 'À signer après l’entretien (statut « A finaliser »).'}
        </Typography>
      ) : !toSign ? (
        <Typography variant="body2" color="text.secondary">
          Vous pourrez signer votre convention après votre entretien.
        </Typography>
      ) : !charteRead ? (
        <Typography variant="body2" color="text.secondary">
          Lisez d'abord la Charte (étape 1).
        </Typography>
      ) : (
        <Stack spacing={1}>
          <FormControlLabel
            control={
              <Checkbox
                checked={consents.utilisation}
                onChange={(e) =>
                  setConsents((c) => ({ ...c, utilisation: e.target.checked }))
                }
              />
            }
            label={
              <Typography variant="body2">
                J'accepte que mes informations soient utilisées uniquement dans
                le cadre des missions de l'Association.
              </Typography>
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={consents.conservation}
                onChange={(e) =>
                  setConsents((c) => ({ ...c, conservation: e.target.checked }))
                }
              />
            }
            label={
              <Typography variant="body2">
                J'autorise l'Association à conserver mes données personnelles.
              </Typography>
            }
          />
          <SignaturePad onChange={setSignature} />
          <Box>
            <Button
              variant="contained"
              startIcon={
                busy ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <DrawIcon />
                )
              }
              disabled={
                busy ||
                !signature ||
                !consents.utilisation ||
                !consents.conservation
              }
              onClick={sign}>
              Signer ma convention
            </Button>
          </Box>
          <Typography variant="caption" color="text.secondary">
            En cliquant, vous signez électroniquement la convention. Vous en
            recevrez un exemplaire signé par la présidente.
          </Typography>
        </Stack>
      )}
    </Step>
  );

  const presidentStep = (
    <Step
      number={4}
      title="Signature de l'association"
      state={complete ? 'done' : signedFile ? 'waiting' : 'todo'}>
      {complete ? (
        convention.final ? (
          <FileLine
            file={convention.final}
            label="Contresignée"
            onView={setView}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            Convention complète (reçue sur papier).
          </Typography>
        )
      ) : signedFile ? (
        admin && signing?.i_am_president && onlineSigned ? (
          <Stack spacing={1}>
            <Typography variant="body2">
              Votre signature sera ajoutée à la convention signée par le
              bénévole.
            </Typography>
            <Box>
              <CountersignButton userId={userId} onDone={load} />
            </Box>
          </Stack>
        ) : (
          <Typography variant="body2" color="warning.dark">
            {admin
              ? onlineSigned
                ? 'À contresigner en ligne par la présidente, depuis cette fiche.'
                : 'Convention papier : à faire signer par la présidente, puis à déposer ici.'
              : "En attente de la signature de la présidente de l'association. Vous recevrez un e-mail dès qu'elle sera disponible."}
          </Typography>
        )
      ) : (
        <Typography variant="body2" color="text.secondary">
          La présidente signe la convention après{' '}
          {admin ? 'le bénévole' : 'vous'}.
        </Typography>
      )}
      {admin && (!onlineSigned || complete) && (
        <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
          <UploadButton
            userId={userId}
            type="final"
            variant="text"
            label={
              convention.final
                ? 'Remplacer la version contresignée'
                : 'Déposer une convention contresignée (papier)'
            }
          />
        </Stack>
      )}
    </Step>
  );

  return (
    <Stack spacing={2} sx={{ maxWidth: 820, mx: admin ? 0 : 'auto', my: 2 }}>
      {signing === null && (
        <Alert severity="error">La convention n'a pas pu être chargée.</Alert>
      )}
      {charteStep}
      {reviewStep}
      {signStep}
      {presidentStep}

      {admin && onValidate && complete && progress.status !== 'Validé' && (
        <Paper variant="outlined" sx={{ p: 2, borderColor: 'success.main' }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            flexWrap="wrap">
            <Typography variant="body2" sx={{ flex: 1 }}>
              {docsOk
                ? 'Convention complète, CV, pièce d’identité et B3 reçus : le dossier peut être validé.'
                : 'Convention complète. Il manque encore : ' +
                  [
                    !documents.cv && 'CV',
                    !documents.id && "pièce d'identité",
                    !documents.b3 && 'B3',
                  ]
                    .filter(Boolean)
                    .join(', ') +
                  '.'}
            </Typography>
            <Button
              variant="contained"
              color="success"
              startIcon={<VerifiedIcon />}
              disabled={!docsOk}
              onClick={onValidate}>
              Passer en Validé
            </Button>
          </Stack>
        </Paper>
      )}

      {!admin && !signedFile && !complete && toSign && (
        <Accordion disableGutters variant="outlined">
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2">
              Je préfère signer sur papier
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1}>
              <Typography variant="body2">
                Ouvrez votre convention pré-remplie (« Voir la convention »),
                imprimez-la, signez-la, puis déposez-la ici, scannée ou en
                photo.
              </Typography>
              <Box>
                <UploadButton
                  userId={userId}
                  variant="outlined"
                  label="Déposer ma convention signée"
                />
              </Box>
            </Stack>
          </AccordionDetails>
        </Accordion>
      )}

      <PdfDialog
        title="Charte de bénévolat"
        url={showCharte ? charte?.inline_url : null}
        onClose={() => setShowCharte(false)}
      />
      <PdfDialog
        title="Convention d'engagement"
        url={preview.url}
        onClose={preview.close}
      />
      {view && (
        <FileDisplay
          s3FilePath={view}
          open={!!view}
          handleClose={() => setView(null)}
        />
      )}
    </Stack>
  );
};

export default ConventionSteps;
