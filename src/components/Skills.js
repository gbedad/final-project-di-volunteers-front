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
      {/* <Typography variant="h6" gutterBottom>
        Skills
      </Typography> */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={12}>
          <DayTimeRangeComponent />
        </Grid>
        <Grid item xs={12} sm={12}>
          <TopicGradeComponent />
        </Grid>
        <Grid item xs={12} sm={12}>
          {/* <LocationSkill/> */}
          <LocationsPossibleComponent />
        </Grid>
        {/* <Grid item xs={12}>
          <TextField
            id="address2"
            name="address2"
            label="Address line 2"
            fullWidth
            autoComplete="shipping address-line2"
            variant="standard"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="city"
            name="city"
            label="City"
            fullWidth
            autoComplete="shipping address-level2"
            variant="standard"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            id="state"
            name="state"
            label="State/Province/Region"
            fullWidth
            variant="standard"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="zip"
            name="zip"
            label="Zip / Postal code"
            fullWidth
            autoComplete="shipping postal-code"
            variant="standard"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="country"
            name="country"
            label="Country"
            fullWidth
            autoComplete="shipping country"
            variant="standard"
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={<Checkbox color="secondary" name="saveAddress" value="yes" />}
            label="Use this address for payment details"
          />
        </Grid> */}
      </Grid>
    </React.Fragment>
  );
};

export default Skills;
