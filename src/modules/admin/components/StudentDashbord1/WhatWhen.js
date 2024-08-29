import React, { useState } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Typography,
  Divider,
} from '@mui/material';

import SubjectPriority from 'modules/admin/StudentDashbord1/components/StudentTopics';
import StudentDaytimes from 'modules/admin/StudentDashbord1/components/StudentDaytimes';
import StudentsLocations from 'modules/admin/StudentDashbord1/components/StudentLocations';
// Sample data - replace with your actual data

const BeneficiaryWhatWhen = () => {
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState('');
  const [day, setDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* ... other boxes ... */}

      <Grid container spacing={2}>
        {/* Matières demandées */}

        <Grid item xs={12} mb={3} style={{ position: 'relative' }}>
          {/* <Typography variant="subtitle1" gutterBottom>
            Matières demandées
          </Typography>
          <SubjectPriority />
          <Typography variant="subtitle1" gutterBottom>
            Disponibilités
          </Typography>
          <StudentDaytimes /> */}
          <Typography variant="subtitle1" gutterBottom>
            Matières demandées
          </Typography>
          <Grid spacing={2}>
            <SubjectPriority />
            {/* <Grid item xs={8}>
              <FormControl fullWidth size="small" shrink>
                <InputLabel>Matière</InputLabel>
                <Select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  label="Matière">
                  {subjects.map((sub) => (
                    <MenuItem key={sub} value={sub}>
                      {sub}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Priorité</InputLabel>
                <Select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  label="Priorité">
                  {priorities.map((prio) => (
                    <MenuItem key={prio} value={prio}>
                      {prio}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid> */}
          </Grid>
        </Grid>
        <Divider color="primary" />
        {/* Disponibilité */}

        <Grid item xs={12} mb={3} style={{ position: 'relative' }}>
          <Typography variant="subtitle1" gutterBottom>
            Disponibilités
          </Typography>
          <Grid spacing={2}>
            <StudentDaytimes />
          </Grid>
        </Grid>
        <Divider />
        {/* Lieux possibles */}
        <Grid item xs={12} mb={3} style={{ position: 'relative' }}>
          <Typography variant="subtitle1" gutterBottom>
            Lieux possibles
          </Typography>
          <StudentsLocations />
        </Grid>
      </Grid>

      {/* ... other boxes ... */}
    </Box>
  );
};

export default BeneficiaryWhatWhen;
