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
import ListItemIcon from '@mui/material/ListItemIcon';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import BorderedBoxWithLabel from '../borderedBox';

const InstructionComponent = () => {
  return (
    <>
      <Grid>
        <Accordion defaultExpanded={true}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header">
            <Typography
              variant="h5"
              sx={{ width: '33%', flexShrink: 0, fontWeight: 'bold' }}
              gutterBottom>
              Comment télécharger mes documents
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2} fluid>
              <Grid item xs={12} md={6} lg={6}>
                <BorderedBoxWithLabel
                  label="Documents à télécharger"
                  sx={{ display: 'flex' }}>
                  <Box p={3}>
                    <Typography variant="body2" sx={{}}>
                      Merci de bien vouloir télécharger ici les documents
                      suivants uniquement dans les formats pdf, jpeg, jpg ou
                      png&nbsp;:
                    </Typography>
                    <Typography variant="body2">
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <FiberManualRecordIcon
                              sx={{ fontSize: '0.6rem' }}
                            />
                          </ListItemIcon>
                          Copie lisible de votre pièce d’identité recto-verso,
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <FiberManualRecordIcon
                              sx={{ fontSize: '0.6rem' }}
                            />
                          </ListItemIcon>
                          CV et/ou copie de diplômes et justificatifs de travail
                          attestant de votre parcours académique et/ou
                          professionnel,
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <FiberManualRecordIcon
                              sx={{ fontSize: '0.6rem' }}
                            />
                          </ListItemIcon>
                          Extrait de casier judiciaire (s’obtient en ligne).
                        </ListItem>
                      </List>
                    </Typography>
                  </Box>
                </BorderedBoxWithLabel>
              </Grid>

              <Grid item xs={12} md={6} lg={6}>
                <BorderedBoxWithLabel
                  label="Nomenclature des fichiers"
                  sx={{ display: 'flex' }}>
                  <Box p={3}>
                    <Typography variant="body2">
                      Vous pouvez télécharger jusqu’à x documents en format pdf,
                      jpg ou png. Merci de bien vouloir les nommer selon la
                      nomenclature suivante :
                      <List sx={{ padding: '0px 0' }}>
                        <ListItem>
                          <b>nom_prénom_cv_1</b>,{' '}
                          <b style={{ margin: '0 3px' }}>nom_prénom_cv_2</b> (si
                          vous avez plusieurs versions),
                        </ListItem>
                        <ListItem>
                          <b style={{ marginRight: '3px' }}>nom_prénom_b3</b>{' '}
                          (un seul document pour l’extrait de casier
                          judiciaire),
                        </ListItem>
                        <ListItem>
                          <b>nom_prénom_id_1</b>,{' '}
                          <b style={{ margin: '0 3px' }}>nom_prénom_id_2</b> (si
                          pièce d’identité en plusieurs fichiers),{' '}
                        </ListItem>
                        <ListItem>
                          <b style={{ marginRight: '3px' }}>
                            nom_prénom_diplôme_1
                          </b>{' '}
                          (copie du diplôme xx en l’absence de cv),{' '}
                        </ListItem>
                        <ListItem>
                          <b style={{ marginRight: '3px' }}>
                            nom_prénom_bulletin_1
                          </b>{' '}
                          (copie de bulletin en l’absence de cv si vous êtes en
                          terminale),{' '}
                        </ListItem>
                        <ListItem>
                          <b style={{ marginRight: '3px' }}>
                            nom_prénom_attestation_1
                          </b>{' '}
                          (copie d’attestation de travail en l’absence de cv).
                        </ListItem>
                      </List>
                    </Typography>
                    <Typography variant="body2">
                      Vous pouvez ajouter tout document utile à l’examen de
                      votre candidature.
                    </Typography>
                  </Box>
                </BorderedBoxWithLabel>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Grid>
    </>
  );
};

export default InstructionComponent;
