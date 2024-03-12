import React, { useEffect, useState, useContext } from 'react';

import Grid from '@mui/material/Grid';
// import Card from './Card'; // Import the Card component;
import Typography from '@mui/material/Typography';
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
      <Box sx={{ flexGrow: 1 }}>
        <Typography
          variant="h4"
          component="h3"
          color="primary.main"
          m={2}
          textAlign={'center'}>
          Demandez la création de votre compte MyCogniverse en postulant à une
          mission !
        </Typography>
        <Grid align="center" container spacing={{ xs: 1, md: 1, lg: 2 }}>
          {cardsData.map((card, index) => (
            <Grid item xs={12} sm={12} md={6} lg={3} key={card.id}>
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
    </>
  );
};

export default CardList;
