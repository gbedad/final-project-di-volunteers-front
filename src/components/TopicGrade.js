import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Typography,
  Button,
  Grid,
  MenuItem,
  TextField,
  Box,
  LinearProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import BorderedBoxWithLabel from './borderedBox';

import { UserContext } from '../UserContext';

const SubjectClassRangeComponent = () => {
  const location = useLocation();
  const [subjectClassRanges, setSubjectClassRanges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userLogged } = location.state;
  const { token } = useContext(UserContext);
  // const subjectClassesRanges = userLogged.user.skill.topics

  const userId = location.state.userLogged.user.id;

  useEffect(() => {
    const getSubjects = async () => {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/user-by-id/${userId}`
      );
      console.log(response.data);
      if (response.data.skill) {
        const parsed_array = response.data.skill.topics.map((string) =>
          JSON.parse(string)
        );
        setSubjectClassRanges(parsed_array);
        setIsLoading(false);
      }
      setIsLoading(false);
    };

    getSubjects();
  }, []);

  const handleAddSubjectClassRange = () => {
    setSubjectClassRanges([
      ...subjectClassRanges,
      { subject: '', classStart: 'K3', classEnd: 'K10' },
    ]);
  };

  const handleSubjectChange = (value, index) => {
    const updatedSubjectClassRanges = [...subjectClassRanges];
    updatedSubjectClassRanges[index].subject = value;
    setSubjectClassRanges(updatedSubjectClassRanges);
  };

  const handleClassStartChange = (value, index) => {
    const updatedSubjectClassRanges = [...subjectClassRanges];
    updatedSubjectClassRanges[index].classStart = value;
    setSubjectClassRanges(updatedSubjectClassRanges);
  };

  const handleClassEndChange = (value, index) => {
    const updatedSubjectClassRanges = [...subjectClassRanges];
    updatedSubjectClassRanges[index].classEnd = value;
    setSubjectClassRanges(updatedSubjectClassRanges);
  };

  const handleRemoveSubjectClassRange = (index) => {
    const updatedSubjectClassRanges = [...subjectClassRanges];
    updatedSubjectClassRanges.splice(index, 1);
    setSubjectClassRanges(updatedSubjectClassRanges);
  };

  const handleSaveSubjectClassRanges = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/create-skill/${userLogged.user.id}`,
        { topics: JSON.stringify(subjectClassRanges) },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': userLogged.token,
          },
        }
      );
      console.log(response.data.message);
      if (response.data.message) {
        console.log('Day and time ranges saved successfully');
      } else {
        console.error('Failed to save day and time ranges');
      }
    } catch (error) {
      console.error('Failed to save day and time ranges', error);
    }
    console.log('Saving subject and class ranges: ', subjectClassRanges);
  };

  return (
    <div>
      <BorderedBoxWithLabel
        label="Matières et classes"
        sx={{ display: 'flex' }}>
        {/* <Typography variant="h5">Subject and Grade Range</Typography> */}
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddSubjectClassRange}
          sx={{ mr: 2 }}>
          Add Subject and Grade Range
        </Button>
        {isLoading ? (
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
          </Box>
        ) : (
          subjectClassRanges.map((subjectClassRange, index) => (
            <Grid
              container
              spacing={1}
              key={index}
              style={{ marginTop: '16px' }}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Subject"
                  select
                  value={subjectClassRange.subject}
                  onChange={(e) => handleSubjectChange(e.target.value, index)}>
                  <MenuItem value="Math">Math</MenuItem>
                  <MenuItem value="Science">Science</MenuItem>
                  <MenuItem value="History">History</MenuItem>
                  <MenuItem value="Physics">Physics</MenuItem>
                  <MenuItem value="Geography">Geography</MenuItem>
                  {/* Add more subjects as needed */}
                </TextField>
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Class Start"
                  select
                  value={subjectClassRange.classStart}
                  onChange={(e) =>
                    handleClassStartChange(e.target.value, index)
                  }>
                  <MenuItem value="K3">K3</MenuItem>
                  <MenuItem value="K4">K4</MenuItem>
                  <MenuItem value="K5">K5</MenuItem>
                  <MenuItem value="K6">K6</MenuItem>
                  <MenuItem value="K7">K7</MenuItem>
                  <MenuItem value="K8">K8</MenuItem>
                  <MenuItem value="K9">K9</MenuItem>
                  <MenuItem value="K10">K10</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Class End"
                  select
                  value={subjectClassRange.classEnd}
                  onChange={(e) => handleClassEndChange(e.target.value, index)}>
                  <MenuItem value="K3">K3</MenuItem>
                  <MenuItem value="K4">K4</MenuItem>
                  <MenuItem value="K5">K5</MenuItem>
                  <MenuItem value="K6">K6</MenuItem>
                  <MenuItem value="K7">K7</MenuItem>
                  <MenuItem value="K8">K8</MenuItem>
                  <MenuItem value="K9">K9</MenuItem>
                  <MenuItem value="K10">K10</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={2}>
                <Button onClick={() => handleRemoveSubjectClassRange(index)}>
                  <DeleteIcon sx={{ fontSize: 40 }} color="secondary" />
                </Button>
              </Grid>
            </Grid>
          ))
        )}
        {subjectClassRanges && (
          <Button
            sx={{ marginTop: '10px' }}
            variant="contained"
            color="primary"
            onClick={handleSaveSubjectClassRanges}>
            Save
          </Button>
        )}
      </BorderedBoxWithLabel>
    </div>
  );
};

export default SubjectClassRangeComponent;
