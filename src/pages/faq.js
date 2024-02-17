import React from 'react';
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FaqTimeline from './faqTimeline.js';

function FAQPage() {
  return (
    <Container maxWidth="md" sx={{ marginTop: '20px' }}>
      <Typography variant="h3" align="center" gutterBottom color={'secondary'}>
        Comment ça marche ?
      </Typography>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header">
          <Typography variant="h6">
            Comment puis-je demander la création de mon compte MyCogniverse ?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography color={'primary'}>
            Dans l’onglet Missions, veuillez choisir une mission qui vous
            convienne. En cliquant sur le bouton « Je postule » d’une mission,
            vous êtes dirigé sur le formulaire de demande de création de compte.
            Dès que votre compte est créé, vous pouvez commencer à renseigner
            votre profil. Vous avez alors la possibilité de choisir une mission
            différente de celle que vous avez sélectionnée en première intention
            pour candidater.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
          id="panel2a-header">
          <Typography variant="h6">
            Quelles sont les étapes à suivre après la création de mon compte
            MyCogniverse ?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography color={'primary'}>
            Une fois votre compte créé, le processus de recrutement de chaque
            bénévole passe par les étapes suivantes. A tout moment bien sûr,
            vous pouvez retirer votre candidature. A tout moment également,
            l’association peut décider de mettre fin au processus.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <FaqTimeline />
          </Box>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
          id="panel2a-header">
          <Typography variant="h6">
            Comment puis-je passer d’une étape à une autre ?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography color={'primary'}>
            Quand vous avez terminé de compléter une page, vous cliquez sur le
            bouton « J’ai terminé ». Entre chaque étape du processus, un membre
            habilité de l’association prend connaissance des informations que
            vous avez eu la gentillesse de saisir. Dès que c’est chose faite,
            vous recevez un mail vous informant que vous pouvez passer à une
            autre étape. Il suffit alors de vous reconnecter sur
            mycogniverse.org pour poursuivre à l’étape suivante.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
          id="panel2a-header">
          <Typography variant="h6">
            Que faire si je rencontre un problème ?
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography color={'primary'}>
            Ecrivez-nous à{' '}
            <a href="mailto:kola@sephoraberrebi.org " target="_top">
              skola@sephoraberrebi.org
            </a>
            , nous vous répondrons dans les meilleurs délais.
          </Typography>
        </AccordionDetails>
      </Accordion>
      {/* Add more Accordion components for additional questions */}
    </Container>
  );
}

export default FAQPage;
