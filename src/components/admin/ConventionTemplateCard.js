import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Alert,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DescriptionIcon from '@mui/icons-material/Description';
import MenuBookIcon from '@mui/icons-material/MenuBook';

const BASE_URL = process.env.REACT_APP_BASE_URL;

// Fields expected in the convention model (PDF form made with LibreOffice)
const FIELD_LABELS = {
  nom_benevole: 'nom du bénévole',
  presentiel: 'case présentiel',
  distanciel: 'case distanciel',
  autre_coche: 'case autre',
  autre_texte: 'texte autre',
  date_fin: 'date de fin',
  lieu: 'lieu',
  horaire: 'horaire',
  consentement_utilisation: 'case utilisation des données',
  consentement_conservation: 'case conservation des données',
  fait_a: 'fait à',
  date_signature: 'date',
};

const KINDS = {
  template: {
    title: 'Modèle de convention',
    icon: DescriptionIcon,
    get: '/convention/template',
    pick: (data) => data.template,
    post: '/admin/convention/template',
    empty:
      'Aucun modèle déposé : les bénévoles ne peuvent pas encore signer en ligne.',
    help: 'PDF avec formulaire, exporté de LibreOffice en cochant « Créer un formulaire PDF ». Les champs sont remplis automatiquement avec les informations de chaque bénévole.',
  },
  charte: {
    title: 'Charte de bénévolat',
    icon: MenuBookIcon,
    get: '/convention/charte',
    pick: (data) =>
      data.charte && { ...data.charte, updated_at: data.charte.version },
    post: '/admin/convention/charte',
    empty:
      'Aucune Charte déposée : les bénévoles ne peuvent pas la lire avant de signer.',
    help: 'Lue par chaque bénévole avant de signer sa convention. Une nouvelle version leur est proposée à la lecture.',
  },
};

// A document the volunteers use for their convention; the team replaces it
// with a new version (e.g. each school year)
const TemplateCard = ({ kind, canReplace }) => {
  const k = KINDS[kind];
  const Icon = k.icon;
  const [doc, setDoc] = useState(undefined);
  const [uploading, setUploading] = useState(false);
  const [missing, setMissing] = useState(null);
  const input = useRef(null);

  const load = useCallback(() => {
    axios
      .get(`${BASE_URL}${k.get}`)
      .then(({ data }) => setDoc(k.pick(data) || null))
      .catch(() => setDoc(null));
  }, [k]);
  useEffect(load, [load]);

  const upload = async (event) => {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    setMissing(null);
    try {
      await axios.post(`${BASE_URL}${k.post}`, formData);
      toast.success(`${k.title} : nouvelle version en ligne`, {
        position: 'bottom-left',
      });
      load();
    } catch (err) {
      if (err.response?.status === 422) {
        setMissing({
          error: err.response.data.error,
          fields: err.response.data.missing || [],
        });
      } else {
        toast.error(
          err.response?.data?.error || "Le document n'a pas pu être déposé",
          {
            position: 'bottom-left',
          }
        );
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        flexWrap="wrap"
        useFlexGap>
        <Icon color="primary" />
        <Typography sx={{ flex: 1, minWidth: 240 }} component="div">
          <b>{k.title}</b>
          <Typography variant="body2" color="text.secondary">
            {doc
              ? `${doc.filename} · déposé le ${new Date(doc.updated_at).toLocaleDateString('fr-FR')}`
              : doc === null
                ? k.empty
                : 'Chargement…'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {k.help}
          </Typography>
        </Typography>
        {doc && (
          <Button size="small" startIcon={<CloudDownloadIcon />} href={doc.url}>
            Télécharger
          </Button>
        )}
        {canReplace && (
          <>
            <input
              ref={input}
              type="file"
              hidden
              accept=".pdf"
              onChange={upload}
            />
            <Button
              size="small"
              variant="outlined"
              disabled={uploading}
              startIcon={
                uploading ? <CircularProgress size={16} /> : <UploadFileIcon />
              }
              onClick={() => input.current.click()}>
              {doc ? 'Remplacer' : 'Déposer'}
            </Button>
          </>
        )}
      </Stack>
      {missing && (
        <Alert
          severity="error"
          sx={{ mt: 1.5 }}
          onClose={() => setMissing(null)}>
          {missing.error}
          {missing.fields.length > 0 &&
            ` Champs manquants : ${missing.fields.map((f) => FIELD_LABELS[f] || f).join(', ')}.`}{' '}
          Vérifiez que le PDF a été exporté avec « Créer un formulaire PDF ».
        </Alert>
      )}
    </Paper>
  );
};

const ConventionTemplateCard = ({ canReplace }) => (
  <>
    <TemplateCard kind="charte" canReplace={canReplace} />
    <TemplateCard kind="template" canReplace={canReplace} />
  </>
);

export default ConventionTemplateCard;
