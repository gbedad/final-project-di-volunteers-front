import React from 'react';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

import Link from '@mui/material/Link';

import Accordion from '@mui/material/Accordion';
import Button from '@mui/material/Button';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ListItemIcon from '@mui/material/ListItemIcon';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import BorderedBoxWithLabel from '../borderedBox';

import pdfFile from '../../assets/presentationtuteurs.pdf';

const InstructionCoventionComponent = () => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfFile;
    link.download = 'convention-reciproque.pdf';
    link.click();
  };
  return (
    <>
      <Grid>
        <Accordion defaultExpanded={true}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
            sx={{ width: '100%' }}>
            <Typography
              variant="h5"
              sx={{ width: '100%', flexShrink: 0, fontWeight: 'bold' }}
              gutterBottom>
              Convention d'engagement
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2} fluid>
              <Grid item xs={12} md={6} lg={6}>
                <BorderedBoxWithLabel
                  label="Télécharger le modèle de convention"
                  sx={{ display: 'flex' }}>
                  <Box p={3}>
                    <Typography variant="body2" mb={2}>
                      Le moment est venu de signer la convention d'engagement
                      réciproque avec l'association Séphora Berrebi.
                    </Typography>
                    <Typography variant="body2">
                      Pour télécharger le modèle, veuillez cliquer sur le lien
                      ci-dessous.
                    </Typography>
                    {/* <Typography variant="body2">
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
                    </Typography> */}
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Button
                      variant="contained"
                      onClick={handleDownload}
                      startIcon={<CloudDownloadIcon />}>
                      Télécharger la convention
                    </Button>
                  </Box>
                </BorderedBoxWithLabel>
              </Grid>

              <Grid item xs={12} md={6} lg={6}>
                <BorderedBoxWithLabel
                  label="Signer la convention"
                  sx={{ display: 'flex' }}>
                  <Box p={3}>
                    <Typography variant="body2">
                      Merci de compléter les champs manquants de la convention
                      puis de la signer.
                      {/* <List sx={{ padding: '0px 0' }}>
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
                          (copie du diplôme en l’absence de cv),{' '}
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
                      </List> */}
                    </Typography>
                    <Typography variant="body2">
                      Pour ce faire, vous pouvez :
                      <List>
                        <ListItem alignItems="flex-start" dense>
                          <ListItemIcon>
                            <FiberManualRecordIcon
                              sx={{ fontSize: '0.6rem' }}
                            />
                          </ListItemIcon>
                          Soit compléter et signer une version papier à scanner
                          ensuite.
                        </ListItem>
                        <ListItem alignItems="flex-start" dense>
                          <ListItemIcon>
                            <FiberManualRecordIcon
                              sx={{ fontSize: '0.6rem' }}
                            />
                          </ListItemIcon>
                          <Typography variant="body2">
                            Soit compléter et signer électroniquement. Des
                            outils du type{' '}
                            <Link
                              href="https://www.ilovepdf.com/fr"
                              target="_blank">
                              'Ilovepdf'
                            </Link>{' '}
                            permettent de le faire facilement et gratuitement.
                          </Typography>
                        </ListItem>
                      </List>
                    </Typography>
                    <Typography variant="body2" mb={2}>
                      Merci de déposer la convention complérée et signée par vos
                      soins dans l'onglet 'MES DOCUMENTS' en utilisant le
                      libellé suivant <strong>nom_prénom_convention</strong>.
                    </Typography>
                    <Typography variant="body2">
                      La version signée par l'association vous sera transmise
                      par mail.
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

export default InstructionCoventionComponent;
