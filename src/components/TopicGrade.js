import React, { useState } from "react";
import {
  Typography,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const TopicGradeComponent = () => {
  const [topicGradeRanges, setTopicGradeRanges] = useState([
    { topic: "", gradeFrom: "", gradeTo: "" }
  ]);

  const handleAddTopicGradeRange = () => {
    setTopicGradeRanges([
      ...topicGradeRanges,
      { topic: "", gradeFrom: "", gradeTo: "" }
    ]);
  };

  const handleTopicChange = (value, index) => {
    const updatedTopicGradeRanges = [...topicGradeRanges];
    updatedTopicGradeRanges[index].topic = value;
    setTopicGradeRanges(updatedTopicGradeRanges);
  };

  const handleGradeFromChange = (value, index) => {
    const updatedTopicGradeRanges = [...topicGradeRanges];
    updatedTopicGradeRanges[index].gradeFrom = value;
    setTopicGradeRanges(updatedTopicGradeRanges);
  };

  const handleGradeToChange = (value, index) => {
    const updatedTopicGradeRanges = [...topicGradeRanges];
    updatedTopicGradeRanges[index].gradeTo = value;
    setTopicGradeRanges(updatedTopicGradeRanges);
  };

  const handleRemoveTopicGradeRange = (index) => {
    const updatedTopicGradeRanges = [...topicGradeRanges];
    updatedTopicGradeRanges.splice(index, 1);
    setTopicGradeRanges(updatedTopicGradeRanges);
  };

  const handleSaveTopicGradeRanges = () => {
    // Send request to store topicGradeRanges in database
    console.log("Saving topic and grade ranges: ", topicGradeRanges);
  };

  return (
    <div>
      <Typography variant="h5">Topic and Grade</Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddTopicGradeRange}
        sx={{mr: 2}}
      >
        Add Topic and Grade Range
      </Button>
      {topicGradeRanges.map((topicGradeRange, index) => (
        <Grid container spacing={2} key={index} style={{ marginTop: "16px" }}>
          <Grid item xs={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Topic</InputLabel>
              <Select
                label="Topic"
                value={topicGradeRange.topic}
                onChange={(e) => handleTopicChange(e.target.value, index)}
              >
                <MenuItem value="">Select a topic</MenuItem>
                <MenuItem value="Math">Math</MenuItem>
                <MenuItem value="Science">Science</MenuItem>
                <MenuItem value="History">History</MenuItem>
                <MenuItem value="English">English</MenuItem>
                {/* Add more topics here */}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              variant="outlined"
              label="Grade From"
              type="number"
              value={topicGradeRange.gradeFrom}
              onChange={(e) => handleGradeFromChange(e.target.value, index)}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              variant="outlined"
              label="Grade To"
              type="number"
              value={topicGradeRange.gradeTo}
              onChange={(e) => handleGradeToChange(e.target.value, index)}
            />
          </Grid>
          <Grid item xs={1}>
            <Button
              onClick={() => handleRemoveTopicGradeRange(index)}
            >
              <DeleteIcon sx={{ fontSize: 40 }} color="secondary"/>
              </Button>
          </Grid>
        </Grid>
      ))}
      <Button variant="contained" color="primary" onClick={handleSaveTopicGradeRanges}>Save</Button>
    </div>
    )
   }

   export default TopicGradeComponent;
