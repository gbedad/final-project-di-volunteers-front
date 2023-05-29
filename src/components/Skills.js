import * as React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

import DaySlotSkill from './DaySlotSkills';
import TopicSkill from './TopicSkills';
import LocationSkill from './LocationSkills';
import DayTimeRangeComponent from './DayTimeRange';
import TopicGradeComponent from './TopicGrade';
import LocationsPossibleComponent from './LocationsPossible';

const Skills = () => {
  return (
    <React.Fragment>
      <Grid container maxWidth="xxl">
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
