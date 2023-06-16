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
      <Box sx={{ flexGrow: 1 }}>
        <Grid
          align="center"
          container
          spacing={{ xs: 2, md: 3 }}
          columns={{ xs: 4, sm: 8, md: 12 }}>
          {displayedMissions.map((mission) => (
            <Grid item xs={3} sm={4} md={4} key={mission.id}>
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
      </Box>
    </>
  );
};

export default CardList;
