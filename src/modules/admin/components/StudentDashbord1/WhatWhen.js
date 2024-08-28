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
} from '@mui/material';

// Sample data - replace with your actual data
const subjects = [
  'Mathématiques',
  'Français',
  'Anglais',
  'Histoire',
  'Physique',
];
const priorities = [1, 2, 3];
const days = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
];
const locations = [
  'Centre-ville',
  'Banlieue Nord',
  'Banlieue Sud',
  'Banlieue Est',
  'Banlieue Ouest',
];

const BeneficiaryPage = () => {
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
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Matières demandées
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={8}>
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
            </Grid>
          </Grid>
        </Grid>

        {/* Disponibilité */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Disponibilité
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Jour</InputLabel>
                <Select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  label="Jour">
                  {days.map((d) => (
                    <MenuItem key={d} value={d}>
                      {d}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <TextField
                size="small"
                fullWidth
                label="Heure début"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }} // 5 min steps
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                size="small"
                fullWidth
                label="Heure fin"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }} // 5 min steps
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Lieux possibles */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Lieux possibles
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel>Lieu</InputLabel>
            <Select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              label="Lieu">
              {locations.map((loc) => (
                <MenuItem key={loc} value={loc}>
                  {loc}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* ... other boxes ... */}
    </Box>
  );
};

export default BeneficiaryPage;
