import React from 'react';
import { Alert } from '@mui/material';
import { joinFrench } from '../../js/applicationProgress';

// One line at the top of "Mes documents": what is done and what comes next
const DocumentsBanner = ({ progress }) => {
  if (!progress) return null;
  const { documents, conventionSigned } = progress;
  // Accompanying volunteer: no CV, no convention; B3 before the validation
  const tutor = progress.tutor !== false;
  const missing = [
    tutor && !documents.cv && 'votre CV',
    !documents.id && "votre pièce d'identité",
  ].filter(Boolean);

  let severity;
  let text;
  if (!tutor && !missing.length) {
    severity = documents.b3 ? 'success' : 'info';
    text = documents.b3 ? (
      "Tous vos documents sont déposés : pièce d'identité et extrait B3."
    ) : (
      <>
        Pièce d'identité déposée : vous pouvez envoyer votre dossier. À fournir
        avant la validation (vous accompagnerez des enfants) :{' '}
        <b>votre extrait de casier judiciaire (B3)</b>.
      </>
    );
  } else if (missing.length) {
    severity = 'warning';
    text = (
      <>
        Il vous reste à déposer : <b>{joinFrench(missing)}</b>.
      </>
    );
  } else if (!documents.b3) {
    severity = 'info';
    text =
      "CV et pièce d'identité déposés : vous pouvez envoyer votre dossier. À fournir ensuite : votre extrait de casier judiciaire (B3), avant la signature de la convention.";
  } else if (!conventionSigned) {
    severity = 'success';
    text =
      "Documents de candidature déposés (CV, pièce d'identité, B3). Prochaine étape après l'entretien : la signature de la convention, dans l'onglet « Ma convention ».";
  } else {
    severity = 'success';
    text =
      "Tous vos documents sont déposés : CV, pièce d'identité, extrait B3 et convention.";
  }
  return (
    <Alert severity={severity} sx={{ maxWidth: 900, mx: 'auto', mb: 2 }}>
      {text}
    </Alert>
  );
};

export default DocumentsBanner;
