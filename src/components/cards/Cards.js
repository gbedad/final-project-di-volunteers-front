import React, { useContext, useEffect, useState } from 'react';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';

import Card from './Card';
import './Card.css';
import { MissionsContext, MissionsProvider } from '../missions/MissionsContext';
import MissionCard from '../missions/MissionCard';
import MissionForm from '../missions/MissionForm2';
import { isManager } from '../../js/roles';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const savedSession = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};

const Title = () => (
  <Typography
    variant="h4"
    component="h3"
    color="primary.main"
    mt={6}
    mb={2}
    textAlign={'center'}>
    Demandez la création de votre compte MyCogniverse
    <br /> en postulant à une mission !
  </Typography>
);

const MissionGrid = ({ missions, renderTools }) => (
  <Grid align="center" container spacing={{ xs: 2, md: 3 }}>
    {missions.map((mission) => (
      <Grid item xs={12} sm={12} md={6} lg={4} key={mission.id}>
        <Box
          sx={{
            position: 'relative',
            opacity: mission.is_active ? 1 : 0.55,
          }}>
          {!mission.is_active && (
            <Chip
              label="Masquée"
              size="small"
              sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}
            />
          )}
          <Card
            sx={{ maxWidth: 450, minWidth: 300 }}
            image_data={mission.image_data}
            image_type={mission.image_type}
            id={mission.id}
            title={mission.title}
            location={mission.location}
            link={mission.link}
            description={mission.description}
            token={localStorage.getItem('token')}
          />
        </Box>
        {renderTools && renderTools(mission)}
      </Grid>
    ))}
  </Grid>
);

// Admins see every mission (hidden ones greyed out) with management tools
const ManagerMissions = ({ userLogged }) => {
  const { missions = [] } = useContext(MissionsContext);

  return (
    <>
      <Alert severity="info" sx={{ mb: 3 }}>
        Vous voyez les missions comme un bénévole, avec les outils de gestion.
        Les missions masquées ne sont visibles que par les administrateurs.
      </Alert>
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <MissionForm userLogged={userLogged} />
      </Box>
      <MissionGrid
        missions={missions}
        renderTools={(mission) => (
          <Box sx={{ maxWidth: 450, mx: 'auto' }}>
            <MissionCard
              mission={mission}
              userLogged={userLogged}
              toolbarOnly
            />
          </Box>
        )}
      />
    </>
  );
};

const PublicMissions = () => {
  const [missions, setMissions] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/missions`)
      .then((response) => response.json())
      .then((data) => setMissions(data.filter((m) => m.is_active === true)))
      .catch((error) => {
        console.error(error);
        setMissions([]);
      });
  }, []);

  return missions === null ? (
    <Box sx={{ width: '100%' }}>
      <LinearProgress />
    </Box>
  ) : (
    <MissionGrid missions={missions} />
  );
};

const CardList = () => {
  const session = savedSession();
  const manager = isManager(session?.user?.role);

  return (
    <Container maxWidth="xl" mt={4}>
      <Box sx={{ flexGrow: 1 }}>
        <Title />
        {manager ? (
          <MissionsProvider>
            <ManagerMissions userLogged={session} />
          </MissionsProvider>
        ) : (
          <PublicMissions />
        )}
      </Box>
    </Container>
  );
};

export default CardList;
