import React, { useContext, useEffect, useState } from 'react';
import { MissionsContext } from './MissionsContext';
import Grid from '@mui/material/Grid';

import Box from '@mui/material/Box';

import LinearProgress from '@mui/material/LinearProgress';
import MissionCard from './MissionCard';

const getBufferImage = (buffer) => {
  if (!buffer) {
    return null; // Return null if the buffer is empty or undefined
  }

  const blob = new Blob(buffer);
  const imageURL = URL.createObjectURL(blob);
  return imageURL;
};

const CardList = ({ userLogged }) => {
  const { missions } = useContext(MissionsContext);

  // const [cardsData, setCardsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displayedMissions, setDisplayedMissions] = useState([]);

  useEffect(() => {
    setDisplayedMissions(missions);
    setIsLoading(false);
  }, [missions]);

  // console.log(displayedMissions);

  return isLoading ? (
    <Box sx={{ width: '100%' }}>
      <LinearProgress />
    </Box>
  ) : (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <Grid align="center" container spacing={{ xs: 2, md: 3 }}>
          {displayedMissions.map((mission) => (
            <Grid item xs={12} sm={12} md={6} lg={4} key={mission.id}>
              <MissionCard
                mission={mission}
                imageData={mission.image_data}
                userLogged={userLogged}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
};

export default CardList;
