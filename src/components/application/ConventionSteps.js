import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  CircularProgress,
  Link,
  Paper,
  Stack,
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

import FileDisplay from '../FileDisplay';
import fallbackModel from '../../assets/Charte_de_benevolat2024-2025.pdf';
import {
  notifyApplicationChanged,
  useApplicationProgress,
} from '../../js/applicationProgress';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const formatDate = (value) => new Date(value).toLocaleDateString('fr-FR');

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
      <Box sx={{ flex: 1 }}>
        <Typography fontWeight={600}>
          {number}. {title}
        </Typography>
        <Box sx={{ mt: 1 }}>{children}</Box>
      </Box>
    </Stack>
  </Paper>
);

// Hidden file input opened by a button; uploads to the convention route
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

// Convention in three steps: download the model, upload it signed, then
// the president countersigns it. admin: the team's view (countersigned
// upload, validation of the application).
const ConventionSteps = ({ userId, admin = false, onValidate }) => {
  const [progress] = useApplicationProgress(userId);
  const [template, setTemplate] = useState(undefined);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/convention/template`)
      .then(({ data }) => setTemplate(data.template))
      .catch(() => setTemplate(null));
  }, []);

  if (!progress?.convention) {
    return <CircularProgress size={24} />;
  }
  const { convention, documents } = progress;
  const signed = convention.signed;
  const complete = convention.state === 'complete';
  const docsOk = documents.cv && documents.id && documents.b3;

  const downloadModel = () => {
    const link = document.createElement('a');
    link.href = template?.url || fallbackModel;
    link.download = template?.filename || 'convention-mycogniverse.pdf';
    link.click();
  };

  return (
    <Stack spacing={2} sx={{ maxWidth: 820, mx: admin ? 0 : 'auto', my: 2 }}>
      <Step
        number={1}
        title="Télécharger la convention"
        state={signed || complete ? 'done' : 'todo'}>
        <Button
          variant={signed || complete ? 'text' : 'contained'}
          size="small"
          startIcon={<CloudDownloadIcon />}
          onClick={downloadModel}>
          Télécharger le modèle
        </Button>
        {template?.updated_at && (
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            version du {formatDate(template.updated_at)}
          </Typography>
        )}
      </Step>

      <Step
        number={2}
        title={
          admin
            ? 'Convention signée par le bénévole'
            : 'Déposer la convention signée'
        }
        state={signed || complete ? 'done' : 'todo'}>
        {signed ? (
          <FileLine file={signed} label="Déposée" onView={setPreview} />
        ) : complete ? (
          <Typography variant="body2" color="text.secondary">
            Convention reçue par l'association.
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {admin
              ? 'Pas encore déposée par le bénévole.'
              : 'Complétez la convention, signez-la puis déposez-la ici (PDF, JPG ou PNG).'}
          </Typography>
        )}
        {!complete && (
          <Box sx={{ mt: 1 }}>
            <UploadButton
              userId={userId}
              variant={signed ? 'text' : 'contained'}
              label={signed ? 'Remplacer' : 'Déposer ma convention signée'}
            />
          </Box>
        )}
      </Step>

      <Step
        number={3}
        title="Signature de l'association"
        state={complete ? 'done' : signed ? 'waiting' : 'todo'}>
        {complete ? (
          convention.final ? (
            <FileLine
              file={convention.final}
              label="Contresignée"
              onView={setPreview}
            />
          ) : (
            <Typography variant="body2" color="text.secondary">
              Convention complète (reçue sur papier).
            </Typography>
          )
        ) : signed ? (
          <Typography variant="body2" color="warning.dark">
            {admin
              ? 'À faire signer par la présidente, puis à déposer ici.'
              : "En attente de la signature de la présidente de l'association. Vous recevrez un e-mail dès qu'elle sera disponible."}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            La présidente signe la convention après votre dépôt.
          </Typography>
        )}
        {admin && (
          <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
            <UploadButton
              userId={userId}
              type="final"
              variant={complete ? 'text' : 'contained'}
              label={
                convention.final
                  ? 'Remplacer la version contresignée'
                  : 'Déposer la convention contresignée'
              }
            />
          </Stack>
        )}
      </Step>

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

      {!admin && (
        <Accordion disableGutters variant="outlined">
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2">
              Comment compléter et signer la convention ?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" component="div">
              Vous pouvez :
              <ul style={{ marginTop: 4 }}>
                <li>
                  l’imprimer, la compléter et la signer à la main, puis la
                  scanner ou la prendre en photo ;
                </li>
                <li>
                  ou la compléter et la signer directement sur votre ordinateur,
                  avec un outil gratuit comme{' '}
                  <Link
                    href="https://www.ilovepdf.com/fr"
                    target="_blank"
                    rel="noreferrer">
                    iLovePDF
                  </Link>
                  .
                </li>
              </ul>
              Une fois la convention signée par la présidente, vous aurez un
              mois pour déposer votre attestation d’honorabilité dans l’onglet «
              Mes documents ».
            </Typography>
          </AccordionDetails>
        </Accordion>
      )}

      {preview && (
        <FileDisplay
          s3FilePath={preview}
          open={!!preview}
          handleClose={() => setPreview(null)}
        />
      )}
    </Stack>
  );
};

export default ConventionSteps;
