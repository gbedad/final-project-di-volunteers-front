import React, { useState } from 'react';
import {
  Container,
  Grid,
  Box,
  Tabs,
  Tab,
  Typography,
  TextField,
  MenuItem,
  Checkbox,
  FormControl,
  FormControlLabel,
  Autocomplete,
  Select,
  InputLabel,
} from '@mui/material';
import BorderBoxWithLabel from 'components/borderedBox'; // Assuming this is your custom component
import { existingClasses } from 'options/existingOptions';
import { SchoolAutocomplete } from '../../components/SchoolAutocomplete';

import WhatWhen from '../../components/StudentDashbord1/WhatWhen';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Generate a list of academic years (current year + 5 future years)
const currentYear = new Date().getFullYear();
const academicYears = Array.from({ length: 6 }, (_, index) => {
  const year = currentYear + index;
  return `${year}/${year + 1}`;
});

export default function BeneficiaryPage() {
  const [tabValue, setTabValue] = useState(0);
  const [academicYear, setAcademicYear] = useState(academicYears[0]);
  const [grade, setGrade] = useState('');
  const [selectedSchool, setSelectedSchool] = useState(null);

  // Extract school names from the JSON data

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box m={4}>
      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={3}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Typography pb={1} mt={2}>
                INFORMATIONS
              </Typography>
            </Box>
            <BorderBoxWithLabel label="Bénéficiaire">
              <TextField
                size="small"
                fullWidth
                label="Nom"
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                size="small"
                fullWidth
                label="Prénom"
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                size="small"
                fullWidth
                label="Date de naissance"
                margin="normal"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
              {/* <TextField
                size="small"
                fullWidth
                select
                label="Classe"
                margin="normal"
                InputLabelProps={{ shrink: true }}>
                {existingClasses.map((grade) => (
                  <MenuItem key={grade} value={grade}>
                    {grade}
                  </MenuItem>
                ))}
              </TextField> */}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth margin="normal" size="small">
                    <InputLabel id="grade-label" shrink>
                      Classe
                    </InputLabel>
                    <Select
                      labelId="grade-label"
                      value={grade}
                      label="Classe"
                      displayEmpty
                      notched
                      onChange={(e) => setGrade(e.target.value)}>
                      {existingClasses.map((g) => (
                        <MenuItem key={g} value={g}>
                          {g}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth margin="normal" size="small">
                    <InputLabel id="academic-year-label">
                      Année scolaire
                    </InputLabel>
                    <Select
                      labelId="academic-year-label"
                      value={academicYear}
                      label="Année scolaire"
                      onChange={(e) => setAcademicYear(e.target.value)}>
                      {academicYears.map((year) => (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              {/* <Autocomplete
                options={schoolOptions}
                renderInput={(params) => (
                  <TextField {...params} label="École" margin="normal" />
                )}
                value={selectedSchool}
                onChange={(event, newValue) => {
                  setSelectedSchool(newValue);
                }}
                fullWidth
              />
              <TextField
                fullWidth
                label="Adresse de l'école"
                margin="normal"
                multiline
                rows={2}
                value={
                  selectedSchool
                    ? schoolsData.find(
                        (school) => school.nom_etablissement === selectedSchool
                      )?.adresse_1
                    : ''
                }
                InputProps={{
                  readOnly: true,
                }}
              /> */}
              <SchoolAutocomplete />
            </BorderBoxWithLabel>
            <BorderBoxWithLabel label="Coordonnées">
              <FormControlLabel control={<Checkbox />} label="Famille" />
              <TextField
                size="small"
                fullWidth
                label="Mail"
                margin="normal"
                type="email"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                size="small"
                fullWidth
                label="Téléphone"
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                size="small"
                fullWidth
                label="Adresse"
                margin="normal"
                multiline
                rows={2}
                InputLabelProps={{ shrink: true }}
              />
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Parent 1
              </Typography>
              <TextField
                fullWidth
                label="Prénom du parent 1"
                margin="normal"
                size="small"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Nom du parent 1"
                margin="normal"
                size="small"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                size="small"
                fullWidth
                label="Téléphone du parent 1"
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                size="small"
                fullWidth
                label="Mail du parent 1"
                margin="normal"
                type="email"
                InputLabelProps={{ shrink: true }}
              />
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Parent 2
              </Typography>
              <TextField
                size="small"
                fullWidth
                label="Prénom du parent 2"
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                size="small"
                fullWidth
                label="Nom du parent 2"
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                size="small"
                InputLabelProps={{ shrink: true }}
                fullWidth
                label="Téléphone du parent 2"
                margin="normal"
              />
              <TextField
                size="small"
                InputLabelProps={{ shrink: true }}
                fullWidth
                label="Mail du parent 2"
                margin="normal"
                type="email"
              />
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Autre
              </Typography>
              <TextField
                size="small"
                fullWidth
                label="Prénom de autre"
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                size="small"
                fullWidth
                label="Nom de autre"
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                size="small"
                InputLabelProps={{ shrink: true }}
                fullWidth
                label="Téléphone de autre"
                margin="normal"
              />
              <TextField
                size="small"
                InputLabelProps={{ shrink: true }}
                fullWidth
                label="Mail de autre"
                margin="normal"
                type="email"
              />
            </BorderBoxWithLabel>
          </Box>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={9}>
          <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="beneficiary tabs">
                <Tab label="DEMANDE" />
                <Tab label="SUIVI ADMINISTRATIF" />
                <Tab label="SUIVI PEDAGOGIQUE" />
              </Tabs>
            </Box>
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <BorderBoxWithLabel label="Quoi & Quand">
                    <WhatWhen />
                  </BorderBoxWithLabel>
                </Grid>
                <Grid item xs={12} md={4}>
                  <BorderBoxWithLabel label="Entretien initial">
                    <TextField
                      fullWidth
                      label="Date de l'entretien"
                      margin="normal"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField fullWidth label="Intervenant" margin="normal" />
                  </BorderBoxWithLabel>
                </Grid>
                <Grid item xs={12} md={4}>
                  <BorderBoxWithLabel label="Historique scolaire">
                    <TextField
                      fullWidth
                      label="Dernier diplôme"
                      margin="normal"
                    />
                    <TextField
                      fullWidth
                      label="Année d'obtention"
                      margin="normal"
                    />
                  </BorderBoxWithLabel>
                </Grid>
              </Grid>
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <Typography>Contenu du suivi administratif</Typography>
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              <Typography>Contenu du suivi pédagogique</Typography>
            </TabPanel>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
