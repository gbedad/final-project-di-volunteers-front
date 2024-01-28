import * as React from 'react';
import Grid from '@mui/material/Grid';

import DayTimeRangeComponent from './DayTimeRange';
import TopicGradeComponent from './TopicGrade';
import LocationsPossibleComponent from './LocationsPossible';
import TimeRangeSlider from './TimeRangeSliderComponent';

const Skills = ({ userId }) => {
  return (
    <React.Fragment>
      <Grid container maxWidth="xxl" spacing={2}>
        <Grid item xs={12} sm={12} md={6} lg={4}>
          <DayTimeRangeComponent userSelected={userId} />
          <TimeRangeSlider userSelected={userId} userLogged />
        </Grid>

        <Grid item xs={12} sm={12} md={6} lg={5}>
          <TopicGradeComponent userSelected={userId} />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={3}>
          {/* <LocationSkill/> */}
          <LocationsPossibleComponent userSelected={userId} />
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default Skills;
