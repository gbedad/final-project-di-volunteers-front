import React, { useEffect, useState } from 'react';

import Grid from '@mui/material/Grid';
import Card from './MissionCard'; // Import the Card component;
import '../cards/Card.css';

import Box from '@mui/material/Box';

import LinearProgress from '@mui/material/LinearProgress';

// const cardsData = [
//   {
//     id: 1,
//     image: 'https://via.placeholder.com/350x200',
//     title: 'Card 1',
//     description:
//       'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
//     link: '#',
//   },
//   {
//     id: 2,
//     image: 'https://via.placeholder.com/350x200',
//     title: 'Card 2',
//     description:
//       'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
//     link: '#',
//   },
//   {
//     id: 3,
//     image: 'https://via.placeholder.com/350x200',
//     title: 'Card 3',
//     description:
//       'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
//     link: '#',
//   },

const getBufferImage = (buffer) => {
  if (!buffer) {
    return null; // Return null if the buffer is empty or undefined
  }

  const blob = new Blob(buffer);
  const imageURL = URL.createObjectURL(blob);
  return imageURL;
};

const CardList = () => {
  const [cardsData, setCardsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  useEffect(() => {
    const fetchMissionsList = async () => {
      try {
        const response = await fetch(`${BASE_URL}/missions`);
        const data = await response.json();
        // console.log(data);
        setCardsData(data);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    setIsLoading(false);

    fetchMissionsList();
  }, [isLoading]);

  console.log(cardsData);

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
      <Grid container spacing={3}>
        {cardsData.map((card, index) => (
          <Grid item xs={12} md={5} lg={4}>
            <Card
              sx={{ maxWidth: 345 }}
              key={index}
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
    </>
  );
};

export default CardList;
