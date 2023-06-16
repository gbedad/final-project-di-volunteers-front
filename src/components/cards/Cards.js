import React, { useEffect, useState, useContext } from 'react';

import Grid from '@mui/material/Grid';
import Card from './Card'; // Import the Card component;
import './Card.css';

import Box from '@mui/material/Box';

import LinearProgress from '@mui/material/LinearProgress';

import { AuthContext } from '../../AuthContext';

const CardList = () => {
  const [cardsData, setCardsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { token } = useContext(AuthContext);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

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
      } catch (error) {
        console.error(error);
      }
    };
    setIsLoading(false);

    fetchMissionsList();
  }, [isLoading]);

  // axios.interceptors.response.use(
  //     response => {
  //         return response
  //     },
  //     error => {
  //         if (!error.response) {
  //             console.log("Please check your internet connection.");
  //         }

  //         return Promise.reject(error)
  //     }
  // )
  // console.log(cardsData);
  return isLoading ? (
    <Box sx={{ width: '100%' }}>
      <LinearProgress />
    </Box>
  ) : (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <Grid
          align="center"
          container
          spacing={{ xs: 2, md: 3, lg: 3 }}
          columns={{ xs: 4, sm: 8, md: 12 }}>
          {cardsData.map((card) => (
            <Grid item xs={3} sm={4} md={4} key={card.id}>
              <Card
                sx={{ maxWidth: 400 }}
                image_data={card.image_data}
                image_type={card.image_type}
                id={card.id}
                title={card.title}
                location={card.location}
                link={card.link}
                description={card.description}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
};

export default CardList;
