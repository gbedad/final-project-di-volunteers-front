import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Alert,
  Box,
  Button,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SendIcon from '@mui/icons-material/Send';
import {
  useApplicationProgress,
  missingItems,
  joinFrench,
} from '../../js/applicationProgress';

const BASE_URL = process.env.REACT_APP_BASE_URL;

// Statuses before the volunteer sends the application
const EARLY_STATUSES = [
  'Compte créé',
  'A renseigner',
  'Renseigné',
  'A télécharger',
];

// Statuses from which the convention is asked
const CONVENTION_STATUSES = ['A finaliser', 'Validé', 'A conserver'];

const Item = ({ done, optional, title, detail, action, onAction }) => (
  <ListItem
    secondaryAction={
      !done &&
      action && (
        <Button size="small" variant="outlined" onClick={onAction}>
          {action}
        </Button>
      )
    }
    sx={{ pr: action && !done ? 16 : 2 }}>
    <ListItemIcon sx={{ minWidth: 36 }}>
      {done ? (
        <CheckCircleIcon color="success" />
      ) : optional ? (
        <ScheduleIcon color="action" />
      ) : (
        <RadioButtonUncheckedIcon color="action" />
      )}
    </ListItemIcon>
    <ListItemText primary={title} secondary={detail} />
  </ListItem>
);

const ApplicationChecklist = ({ userId, onGoToTab, onStatusChange }) => {
  const [progress, refresh] = useApplicationProgress(userId);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (progress) onStatusChange?.(progress.status);
  }, [progress, onStatusChange]);

  const send = async () => {
    setSending(true);
    try {
      await axios.post(`${BASE_URL}/application/${userId}/submit`);
      toast.success(
        "Votre dossier est envoyé ! Nous vous contacterons pour l'entretien.",
        { position: 'top-center', duration: 6000 }
      );
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Envoi impossible', {
        position: 'top-center',
      });
    } finally {
      setSending(false);
    }
  };

  if (!progress) return null;
  if (progress.status === 'Déclinée') return null;

  const { profile, wishes, documents } = progress;
  const missing = missingItems(progress);
  const toFill = (items) => `À indiquer : ${joinFrench(items)}`;
  const sent = !EARLY_STATUSES.includes(progress.status);
  // After the interview: the convention is part of the application
  const convention = progress.convention;
  const conventionAsked =
    CONVENTION_STATUSES.includes(progress.status) ||
    (convention && convention.state !== 'to_sign');
  const conventionDone = convention?.state === 'complete';
  const steps = [profile, wishes, documents.cv && documents.id, sent];
  if (conventionAsked) steps.push(conventionDone);
  const done = steps.filter(Boolean).length;
  const missingDocs = [
    !documents.cv && 'CV',
    !documents.id && "pièce d'identité",
  ].filter(Boolean);

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3, maxWidth: 720, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <Typography variant="h6" sx={{ flex: 1 }}>
          Mon dossier de candidature
        </Typography>
        <Typography color="text.secondary">
          {done}/{steps.length}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={(done / steps.length) * 100}
        sx={{ height: 8, borderRadius: 4, mb: 1 }}
      />
      <List dense>
        <Item
          done={profile}
          title="Mon profil"
          detail={profile ? 'Rempli' : toFill(missing.profile)}
          action="Compléter"
          onAction={() => onGoToTab(1)}
        />
        <Item
          done={wishes}
          title="Mes souhaits et disponibilités"
          detail={wishes ? 'Remplis' : toFill(missing.wishes)}
          action="Compléter"
          onAction={() => onGoToTab(2)}
        />
        <Item
          done={documents.cv && documents.id}
          title="Mes documents"
          detail={
            missingDocs.length
              ? `À déposer : ${missingDocs.join(' et ')}`
              : "CV et pièce d'identité déposés"
          }
          action="Déposer"
          onAction={() => onGoToTab(3)}
        />
        <Item
          done={documents.b3}
          optional
          title="Mon extrait de casier judiciaire (B3)"
          detail={
            documents.b3
              ? 'Déposé'
              : 'À fournir avant la signature de la convention (pas nécessaire pour l’entretien)'
          }
          action="Déposer"
          onAction={() => onGoToTab(3)}
        />
        {conventionAsked && (
          <Item
            done={conventionDone}
            optional={convention?.state === 'to_countersign'}
            title="Ma convention"
            detail={
              conventionDone
                ? "Signée par vous et par l'association"
                : convention?.state === 'to_countersign'
                  ? `Déposée le ${new Date(
                      convention.signed.uploaded_at
                    ).toLocaleDateString(
                      'fr-FR'
                    )} : en attente de la signature de la présidente`
                  : 'À télécharger, signer et déposer'
            }
            action={convention?.state === 'to_countersign' ? 'Voir' : 'Signer'}
            onAction={() => onGoToTab(4)}
          />
        )}
        {/* Only asked once the convention is signed */}
        {progress.conventionSigned && (
          <Item
            done={documents.honorability}
            optional
            title="Mon attestation d'honorabilité"
            detail={
              documents.honorability
                ? 'Reçue'
                : progress.honorabilityDue
                  ? `À fournir avant le ${new Date(
                      progress.honorabilityDue
                    ).toLocaleDateString('fr-FR')}`
                  : 'À fournir au plus tard un mois après la signature de la convention'
            }
            action="Déposer"
            onAction={() => onGoToTab(3)}
          />
        )}
      </List>

      {sent ? (
        <Alert severity="success" sx={{ mt: 1 }}>
          {progress.status === 'Validé'
            ? 'Votre candidature est validée. Bienvenue parmi les tuteurs bénévoles !'
            : !conventionAsked
              ? "Votre dossier a été envoyé. Nous vous contacterons pour organiser l'entretien."
              : conventionDone
                ? "Votre convention est complète : l'association va valider votre dossier."
                : convention?.state === 'to_countersign'
                  ? 'Merci ! Votre convention est en cours de signature par la présidente.'
                  : 'Votre entretien est passé : dernière étape, signer votre convention.'}
        </Alert>
      ) : (
        <Box sx={{ mt: 1, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<SendIcon />}
            disabled={!progress.canSubmit || sending}
            onClick={send}>
            Envoyer mon dossier
          </Button>
          {!progress.canSubmit && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Le bouton s'active dès que les trois premières étapes sont
              complètes.
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default ApplicationChecklist;
