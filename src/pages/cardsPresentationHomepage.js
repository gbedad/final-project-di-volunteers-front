import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Container,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Button,
  Typography,
  Modal,
  Box,
  IconButton,
  Link,
} from '@mui/material';

import { ReactComponent as YourSVGImage1 } from '../assets/pres1.svg'; // Import your SVG image
import { ReactComponent as YourSVGImage2 } from '../assets/pres1.svg'; // Import your SVG image
import { ReactComponent as Assoc1 } from '../assets/association/1.svg'; // Import your SVG image
import { ReactComponent as Assoc2 } from '../assets/association/2.svg'; // Import your SVG image
import { ReactComponent as Assoc3 } from '../assets/association/3.svg'; // Import your SVG image
import { ReactComponent as Assoc4 } from '../assets/association/4.svg'; // Import your SVG image
import { ReactComponent as Tuto1 } from '../assets/tutorat/5.svg'; // Import your SVG image
import { ReactComponent as Tuto2 } from '../assets/tutorat/6.svg'; // Import your SVG image
import { ReactComponent as Tuto3 } from '../assets/tutorat/7.svg'; // Import your SVG image
import { ReactComponent as Tuto4 } from '../assets/tutorat/8.svg'; // Import your SVG image
import { ReactComponent as Tuto5 } from '../assets/tutorat/9.svg'; // Import your SVG image

import ImageMissions from '../assets/association/Mission2.png';
import ImageTutorat from '../assets/tutorat/Tutorat.jpg';
import LogoASB from '../assets/association/Association2.png';
import CloseIcon from '@mui/icons-material/Close';

const CardPresentation = () => {
  const navigate = useNavigate();
  const [openModal1, setOpenModal1] = useState(false);
  const [openModal2, setOpenModal2] = useState(false);
  const [activePage1, setActivePage1] = useState(1);
  const [activePage2, setActivePage2] = useState(1);

  const handleOpenModal1 = () => {
    setOpenModal1(true);
  };

  const handleCloseModal1 = () => {
    setOpenModal1(false);
  };

  const handleOpenModal2 = () => {
    setOpenModal2(true);
  };

  const handleCloseModal2 = () => {
    setOpenModal2(false);
  };

  const gotoMissions = () => {
    navigate('./missions');
  };

  const handleNextPage1 = () => {
    setActivePage1((prevPage) => (prevPage < 5 ? prevPage + 1 : prevPage));
  };

  const handlePreviousPage1 = () => {
    setActivePage1((prevPage) => (prevPage > 1 ? prevPage - 1 : prevPage));
  };
  const handleNextPage2 = () => {
    setActivePage2((prevPage) => (prevPage < 5 ? prevPage + 1 : prevPage));
  };

  const handlePreviousPage2 = () => {
    setActivePage2((prevPage) => (prevPage > 1 ? prevPage - 1 : prevPage));
  };

  return (
    <Box sx={{ flexGrow: 1, marginTop: '20px' }}>
      {/* <Box mt={2}> */}
      {/* Cards */}
      <Grid
        container
        spacing={{ xs: 1, md: 2, lg: 2, xl: 3 }}
        columns={{ xs: 1, sm: 1, md: 6, lg: 12 }}>
        {/* Card 1 */}
        <Grid item xs={4} sm={4} md={6} lg={4}>
          <Card
            className="card animated-card"
            sx={{
              maxWidth: 450,
              width: 380,
              minWidth: 350,
              height: 540,

              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
            {/* Your image */}
            <img
              src={LogoASB}
              alt="Logo association"
              style={{
                width: '100%',
              }}
            />
            <div className="card-body">
              <CardContent>
                {/* Title */}
                <Typography gutterBottom variant="h5" component="div">
                  L'association
                </Typography>
                {/* Description */}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: 'left' }}>
                  L'association Séphora Berrebi accompagne les enfants,
                  adolescents et jeunes adultes empêchés dans leurs
                  apprentissages pour des raisons d'ordre socio-culturel ou
                  médical (maladie grave ou chronique, handicap cognitif,
                  trouble de l'apprentissage) de différentes façons : tutorat,
                  accompagnement personnalisé, stages, activités à l'hôpital,
                  évènements, etc.
                </Typography>
              </CardContent>

              <CardActions
                sx={{ display: 'flex', justifyContent: 'space-between' }}>
                {/* Button to open modal */}
                <Button size="standard" onClick={handleOpenModal1}>
                  En savoir plus
                </Button>

                <Link
                  sx={{ textDecoration: 'none', fontSize: 'small' }}
                  href="https://sephoraberrebi.org"
                  rel="noopener"
                  target="_blank">
                  SITE DE L'ASSOCIATION
                </Link>
              </CardActions>
            </div>
          </Card>
        </Grid>
        {/* Card 2 */}
        <Grid item xs={2} sm={4} md={4} lg={4}>
          <Card
            className="card animated-card"
            sx={{
              minWidth: 350,
              width: 380,
              maxWidth: 450,

              height: 540,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
            {/* Your image */}
            <img src={ImageTutorat} alt="Tutorat" style={{ width: '100%' }} />
            <div className="card-body">
              <CardContent>
                {/* Title */}
                <Typography gutterBottom variant="h5" component="div">
                  Le tutorat
                </Typography>
                {/* Description */}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: 'left' }}>
                  Le pôle d'éducation solidaire de l'association Séphora Berrebi
                  met en place des séances de tutorat personnalisé afin d'aider
                  des enfants, adolescents ou jeunes adultes sur leur chemin de
                  progrès dans les disciplines scolaires voire universitaires.
                  Le tutorat ? Tout un symbole ! Il s'agit d'accompagner et de
                  guider un élève ou un étudiant pour l'encourager à devenir
                  actif et autonome dans ses apprentissages.
                  {/* <a href="https://fr.freepik.com/vecteurs-libre/fond-concept-travail-equipe-3d_6144599.htm#query=missions&position=7&from_view=search&track=sph&uuid=61f6fb43-db6f-4b20-b058-ad1453a3b926">
                    Image de pikisuperstar
                  </a>{' '}
                  sur Freepik
                  <a href="https://fr.freepik.com/vecteurs-libre/equipe-affaires-escaladant-poignee-main-geante-soutien-du-chef_18733161.htm#query=tutorat&position=18&from_view=search&track=sph&uuid=5e6dcb4f-368d-4db1-9da7-bb7be0d4df9b">
                    Image de pch.vector
                  </a>{' '}
                  sur Freepik */}
                </Typography>
              </CardContent>

              <CardActions>
                {/* Button to open modal */}
                <Button onClick={handleOpenModal2}>En savoir plus</Button>
              </CardActions>
            </div>
          </Card>
        </Grid>
        <Grid item xs={2} sm={4} md={4} lg={4}>
          {/* Card 3 */}
          <Card
            className="card animated-card"
            sx={{
              minWidth: 350,
              maxWidth: 450,
              width: 380,
              height: 540,

              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
            {/* Your image */}
            <img src={ImageMissions} alt="Missions" style={{ width: '100%' }} />
            <div className="card-body">
              <CardContent>
                {/* Title */}
                <Typography gutterBottom variant="h5" component="div">
                  Les missions
                </Typography>
                {/* Description */}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: 'left' }}>
                  Pour devenir bénévole au sein de l'association Séphora
                  Berrebi, il suffit de candidater à l'une des missions
                  bénévoles proposées. Suite à nos échanges, il sera possible de
                  modifier la mission. La plupart des missions portent sur du
                  tutorat : le besoin d'aide d'enfants issus de milieux peu
                  favorisés ne cesse de croître, notre liste d'attente de
                  bénéficiaires en demande n'en finit pas de s'allonger.
                </Typography>
              </CardContent>

              <CardActions>
                {/* Button to open modal */}
                <Button onClick={gotoMissions}>Voir les missions</Button>
              </CardActions>
            </div>
          </Card>
        </Grid>
      </Grid>
      {/* </Box> */}

      {/* Modal 1 */}
      <Modal
        open={openModal1}
        onClose={handleCloseModal1}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description">
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
            maxWidth: '100vw',
            maxHeight: '100vh',
            overflow: 'auto',
            textAlign: 'center',
          }}>
          <IconButton
            aria-label="Close"
            onClick={handleCloseModal1}
            sx={{
              position: 'absolute',
              top: '5px',
              right: '5px',
            }}>
            <CloseIcon />
          </IconButton>
          {activePage1 === 1 && (
            <div>
              {/* SVG Image */}
              <Assoc1
                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
              />
            </div>
          )}
          {activePage1 === 2 && (
            <div>
              {/* SVG Image */}
              <Assoc2
                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
              />
            </div>
          )}
          {activePage1 === 3 && (
            <div>
              {/* SVG Image */}
              <Assoc3
                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
              />
            </div>
          )}
          {activePage1 === 4 && (
            <div>
              {/* SVG Image */}
              <Assoc4
                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
              />
            </div>
          )}

          {/* Pagination buttons */}
          <Box mt={2}>
            <Button onClick={handlePreviousPage1} disabled={activePage1 === 1}>
              Page précédente
            </Button>
            <Button onClick={handleNextPage1} disabled={activePage1 === 4}>
              Page suivante
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Modal 2 */}
      <Modal
        open={openModal2}
        onClose={handleCloseModal2}
        aria-labelledby="modal2-modal-title"
        aria-describedby="modal2-modal-description">
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
            maxWidth: '100vw',
            maxHeight: '100vh',

            overflow: 'hidden', // Hide overflow content
            textAlign: 'center',
          }}>
          <IconButton
            aria-label="Close"
            onClick={handleCloseModal2}
            sx={{
              position: 'absolute',
              top: '5px',
              right: '5px',
            }}>
            <CloseIcon />
          </IconButton>
          {activePage2 === 1 && (
            <div>
              {/* SVG Image */}
              <Tuto1
                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
              />
            </div>
          )}
          {activePage2 === 2 && (
            <div>
              {/* SVG Image */}
              <Tuto2
                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
              />
            </div>
          )}
          {activePage2 === 3 && (
            <div>
              {/* SVG Image */}
              <Tuto3
                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
              />
            </div>
          )}
          {activePage2 === 4 && (
            <div>
              {/* SVG Image */}
              <Tuto4
                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
              />
            </div>
          )}
          {activePage2 === 5 && (
            <div>
              {/* SVG Image */}
              <Tuto5
                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
              />
            </div>
          )}

          {/* Pagination buttons */}
          <Box mt={2}>
            <Button onClick={handlePreviousPage2} disabled={activePage2 === 1}>
              Page précédente
            </Button>
            <Button onClick={handleNextPage2} disabled={activePage2 === 5}>
              Page suivante
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default CardPresentation;
