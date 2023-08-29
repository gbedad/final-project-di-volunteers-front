import React from 'react';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const InstructionComponent = () => {
  return (
    <>
      <Grid container spacing={2} mb={3}>
        <Accordion defaultExpanded={true}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header">
            <Typography
              variant="h5"
              sx={{ width: '33%', flexShrink: 0, fontWeight: 'bold' }}
              gutterBottom>
              Instructions
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid item xs={12}>
              <Box p={3}>
                <Typography variant="body2" sx={{}}>
                  Merci de bien vouloir télécharger ici les documents suivants
                  uniquement dans les formats pdf, jpeg, jpg ou png :
                </Typography>
                <Typography variant="body2">
                  <List>
                    <ListItem>
                      Copie lisible de votre pièce d’identité recto-verso,
                    </ListItem>
                    <ListItem>
                      CV et/ou copie de diplômes et justificatifs de travail
                      attestant de votre parcours académique et/ou
                      professionnel,
                    </ListItem>
                    <ListItem>
                      Extrait de casier judiciaire (s’obtient en ligne).
                    </ListItem>
                  </List>
                </Typography>
                <Typography variant="body2">
                  Vous pouvez télécharger jusqu’à x documents en format pdf, jpg
                  ou png. Merci de bien vouloir les nommer selon la nomenclature
                  suivante : <i>nom_prénom_cv_1</i>,<i>nom_prénom_cv_2</i> (si
                  vous avez plusieurs versions),
                  <i>nom_prénom_b3</i> (un seul document pour l’extrait de
                  casier judiciaire), <i>nom_prénom_id_1</i>,{' '}
                  <i>nom_prénom_id_2</i> (si pièce d’identité en plusieurs
                  fichiers), <i>nom_prénom_diplômexx</i> (copie du diplôme xx en
                  l’absence de cv), <i>nom_prénom_bulletin_1</i>
                  (copie de bulletin en l’absence de cv si vous êtes en
                  terminale), <i>nom_prénom_attestationyy</i> (copie
                  d’attestation de travail en l’absence de cv).
                </Typography>
                <Typography variant="body2">
                  Vous pouvez ajouter tout document utile à l’examen de votre
                  candidature.
                </Typography>
              </Box>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Grid>
    </>
  );
};

export default InstructionComponent;
