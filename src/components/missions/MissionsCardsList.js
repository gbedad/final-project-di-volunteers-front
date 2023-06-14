import React, { useContext, useEffect, useState } from 'react';
import { MissionsContext } from './MissionsContext';
import Grid from '@mui/material/Grid';

import Box from '@mui/material/Box';

import LinearProgress from '@mui/material/LinearProgress';
import MissionCard from './MissionCard';
import MissionForm from './MissionForm2';

const getBufferImage = (buffer) => {
  if (!buffer) {
    return null; // Return null if the buffer is empty or undefined
  }

  const blob = new Blob(buffer);
  const imageURL = URL.createObjectURL(blob);
  return imageURL;
};

const CardList = () => {
  const { missions } = useContext(MissionsContext);
  // const [cardsData, setCardsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displayedMissions, setDisplayedMissions] = useState([]);

  useEffect(() => {
    setDisplayedMissions(missions);
    setIsLoading(false);
  }, [missions]);

  console.log(displayedMissions);

  return isLoading ? (
    <Box sx={{ width: '100%' }}>
      <LinearProgress />
    </Box>
  ) : (
    <>
      <MissionForm />
      <Grid container spacing={1}>
        {displayedMissions.map((mission) => (
          <Grid item xs={12} md={4} lg={3} key={mission.id}>
            {/* <Card
              sx={{ maxWidth: 400 }}
              image_data={card.image_data}
              image_type={card.image_type}
              image_name={card.image_name}
              id={card.id}
              title={card.title}
              location={card.location}
              link={card.link}
              description={card.description}
            /> */}
            <MissionCard mission={mission} imageData={mission.image_data} />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default CardList;
