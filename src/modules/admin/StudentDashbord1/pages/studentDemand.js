import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  Button,
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
import PreInterviewComponent from '../components/StudentPreInterview';
import StudentDiscussionThread from '../components/StudentDiscussionThread';
import StudentInterview from '../components/StudentInterview';
import SchoolHistory from '../components/SchoolHistory';

import { useAuth } from '../../../../AuthContext';

import {
  fetchStudentById,
  updateStudentFields,
} from '../../api/studentsById.js';

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
  const [level, setLevel] = useState('');
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [parent1_firstname, setParent1_firstname] = useState('');
  const [parent1_lastname, setParent1_lastname] = useState('');
  const [parent1_email, setParent1_email] = useState('');
  const [parent1_phone, setParent1_phone] = useState('');

  const [parent2_firstname, setParent2_firstname] = useState('');
  const [parent2_lastname, setParent2_lastname] = useState('');
  const [parent2_email, setparent2_email] = useState('');
  const [parent2_phone, setParent2_phone] = useState('');
  const [other_firstname, setOther_firstname] = useState('');
  const [other_lastname, setOther_lastname] = useState('');
  const [other_email, setOther_email] = useState('');
  const [other_phone, setOther_phone] = useState('');
  const [isFamily, setFamily] = useState(false);
  const [student, setStudent] = useState(null);
  const [error, setError] = useState(null);
  const { id } = useParams();

  // const location = useLocation();
  // const { userLogged, userSelected } = location.state || {};

  // const navigate = useNavigate();
  const { user } = useAuth();

  // console.log(userSelected);

  // Extract school names from the JSON data

  useEffect(() => {
    const getStudent = async () => {
      try {
        const data = await fetchStudentById(id);
        setStudent(data);
      } catch (err) {
        setError(err.message);
      }
    };

    getStudent();
  }, [id]);

  if (error) return <div>Error: {error}</div>;
  if (!student) return <div>Loading...</div>;

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleConfirmClick = async () => {
    try {
      const updatedFields = {
        level,
        academicYear,
        selectedSchool,
        birthdate,
        isFamily,
        email,
        phone,
        address,
        parent1_firstname,
        parent1_lastname,
        parent1_phone,
        parent1_email,

        parent2_firstname,
        parent2_lastname,
        parent2_phone,
        parent2_email,

        other_firstname,
        other_lastname,
        other_phone,
        other_email,
      };

      // Only include fields that have been changed
      const fieldsToUpdate = Object.entries(updatedFields)
        .filter(([key, value]) => value !== '')
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

      const updatedStudent = await updateStudentFields(id, fieldsToUpdate);

      // Handle successful update (e.g., show a success message, update local state, etc.)
      console.log('Updated student:', updatedStudent);
    } catch (error) {
      // Handle error (e.g., show error message to user)
      console.error('Failed to update student:', error);
    }
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
                value={student.last_name}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                size="small"
                fullWidth
                label="Prénom"
                margin="normal"
                value={student.first_name}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                size="small"
                fullWidth
                label="Date de naissance"
                margin="normal"
                type="date-local"
                value={
                  birthdate ||
                  new Date(student.birth_date).toLocaleString().slice(0, 10)
                }
                onChange={(e) => setBirthdate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth margin="normal" size="small">
                    <InputLabel id="grade-label" shrink>
                      Classe
                    </InputLabel>
                    <Select
                      labelId="grade-label"
                      value={level || student.level}
                      label="Classe"
                      notched
                      onChange={(e) => setLevel(e.target.value)}>
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
                value={student.email}
                onChange={(e) => setEmail(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                size="small"
                fullWidth
                label="Téléphone"
                margin="normal"
                value={student.phone}
                onChange={(e) => setPhone(e.target.value)}
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
              <Button
                sx={{ width: 'fit-content' }}
                variant="contained"
                // disabled={!showConfirm}
                onClick={handleConfirmClick}
                mb={3}>
                Enregistrer
              </Button>
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
            {/* Bloc de droite */}
            {/* --------------------------------- */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <BorderBoxWithLabel label="Quoi & Quand">
                    <WhatWhen />
                  </BorderBoxWithLabel>

                  <BorderBoxWithLabel
                    label="Premier contact"
                    style={{ marginTop: '2rem' }}>
                    <PreInterviewComponent user={user} studentId={id} />
                  </BorderBoxWithLabel>
                  <BorderBoxWithLabel
                    label="Fil de discussion interne"
                    style={{ marginTop: '2rem' }}>
                    <StudentDiscussionThread
                      currentUser={user}
                      studentId={id}
                    />
                  </BorderBoxWithLabel>
                </Grid>
                <Grid item xs={12} md={4}>
                  <BorderBoxWithLabel label="Entretien initial">
                    <StudentInterview user={user} studentId={id} />
                    {/* <TextField
                      fullWidth
                      label="Date de l'entretien"
                      margin="normal"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField fullWidth label="Intervenant" margin="normal" /> */}
                  </BorderBoxWithLabel>
                </Grid>
                <Grid item xs={12} md={4}>
                  <BorderBoxWithLabel label="Historique scolaire et le cas échéant médical">
                    <SchoolHistory />
                    {/* <TextField
                      fullWidth
                      label="Dernier diplôme"
                      margin="normal"
                    />
                    <TextField
                      fullWidth
                      label="Année d'obtention"
                      margin="normal"
                    /> */}
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
