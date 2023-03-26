import React, {useEffect, useState} from 'react';
import axios from 'axios';
import Card from './Card'; // Import the Card component;
import './Card.css';

import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack'



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
// ];

const CardList = () => {
    const [cardsData, setCardsData] = useState([]);
    useEffect(() => {
        const getCardList = async () => {
          const data = await fetchMissionsList();
          setCardsData(data);
        };
    
        getCardList();
      }, []);


    const fetchMissionsList = async () => {
        try {
          const response = await axios.get('/');
          return response.data.missions;
        } catch (error) {
          console.error(error);
        }
      
      };
      axios.interceptors.response.use(
          response => {
              return response
          },
          error => {
              if (!error.response) {
                  console.log("Please check your internet connection.");
              }
      
              return Promise.reject(error)
          }
      )
console.log(cardsData);
  return (
    cardsData.length === 0 ? (
      <Stack sx={{ display: 'flex', alignItems:"center", justifyContent:"center" }}>
        <CircularProgress />
      </Stack>
    ): 
    (
    <Container className='card-list' sx={{display:"flex", justifyContent:"center"}}>
 
        {cardsData.map((card) => (
        <Card
            key={card.id}
            image={card.image}
            id={card.id}
            title={card.title}
            description={card.description}
            link={card.link}
        />
        ))}
       
    </Container>
    )
  );
};

export default CardList;
