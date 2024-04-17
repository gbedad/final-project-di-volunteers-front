import React, { useEffect, useState, useContext } from 'react';

import Grid from '@mui/material/Grid';
// import Card from './Card'; // Import the Card component;
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Card from './Card';
import './Card.css';

import Box from '@mui/material/Box';

import LinearProgress from '@mui/material/LinearProgress';

import { AuthContext } from '../../AuthContext';

const CardList = () => {
  const [cardsData, setCardsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { token } = useContext(AuthContext);

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const userToken = localStorage.getItem('token');

  useEffect(() => {
    const fetchMissionsList = async () => {
      try {
        const response = await fetch(`${BASE_URL}/missions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        // console.log(data);
        const filteredIsActive = data.filter(
          (mission) => mission.is_active === true
        );
        setCardsData(filteredIsActive);
        setIsLoading(false);
        return true;
      } catch (error) {
        if (error.message === 'Failed to fetch') {
        }
        console.error(error);
      }
    };
    setIsLoading(false);

    fetchMissionsList();
    // eslint-disable-next-line
  }, []);

  return isLoading ? (
    <Box sx={{ width: '100%' }}>
      <LinearProgress />
    </Box>
  ) : (
    <>
      <Container maxWidth="xl" mt={4}>
        <Box sx={{ flexGrow: 1 }}>
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
          <Grid align="center" container spacing={{ xs: 2, md: 3 }}>
            {cardsData.map((card) => (
              <Grid item xs={12} sm={12} md={6} lg={4} key={card.id}>
                <Card
                  sx={{ maxWidth: 450, minWidth: 300 }}
                  image_data={card.image_data}
                  image_type={card.image_type}
                  id={card.id}
                  title={card.title}
                  location={card.location}
                  link={card.link}
                  description={card.description}
                  token={userToken}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </>
  );
};

export default CardList;
