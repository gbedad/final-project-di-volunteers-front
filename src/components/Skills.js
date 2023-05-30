import * as React from 'react';
import Grid from '@mui/material/Grid';

import DayTimeRangeComponent from './DayTimeRange';
import TopicGradeComponent from './TopicGrade';
import LocationsPossibleComponent from './LocationsPossible';

const Skills = () => {
  return (
    <React.Fragment>
      <Grid container maxWidth="xxl" spacing={2}>
        <Grid item xs={12} sm={12} md={6} lg={4}>
          <DayTimeRangeComponent />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={5}>
          <TopicGradeComponent />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={3}>
          {/* <LocationSkill/> */}
          <LocationsPossibleComponent />
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default Skills;
