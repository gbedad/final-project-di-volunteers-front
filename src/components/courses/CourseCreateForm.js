import React, { useState, useContext } from 'react';
import { faker } from '@faker-js/faker';
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Box,
  Autocomplete,
} from '@mui/material';

import { CourseContext } from './CourseContext';

import {
  existingSubjects,
  existingLocations,
  existingRooms,
  existingClasses,
} from '../../options/existingOptions';

import InstancesPage from './InstancesPage';

// Mock data for select options

const studentsfakeFullNames = Array.from(
  { length: 120 },
  () => `${faker.person.firstName()} ${faker.person.lastName()}`
);

const days = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
];

const tutor_users = JSON.parse(localStorage.getItem('users'));

// let tutors = [];
// tutor_users.map((item, index) => {
//   return tutors.push({
//     tutorId: item.id,
//     fullname: `${item.first_name} ${item.last_name}`,
//   });
// });

// const options = tutors.map((tutorUser) => ({
//   userid: tutorUser.tutorId,
//   label: tutorUser.fullname,
// }));

const CreateCourseForm = ({ onCourseCreate }) => {
  const [day, setDay] = useState('');
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  const [tutor, setTutor] = useState('');
  const [student, setStudent] = useState('');
  const [subject, setSubject] = useState('');
  const [classe, setClasse] = useState('');
  const [location, setLocation] = useState('');
  const [room, setRoom] = useState('');
  const [inputTutorValue, setInputTutorValue] = React.useState('');
  const [inputStudentValue, setInputStudentValue] = React.useState('');

  // const { dispatch, courses } = useContext(CourseContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    const course = {
      id: Date.now(),
      tutor,
      student,
      subject,
      classe,
      location,
      room,
      day,
      timeStart,
      timeEnd,
      instances: [],
    };
    onCourseCreate(course);

    setDay('');
    setTimeStart('');
    setTimeEnd('');
    setTutor('');
    setStudent('');
    setSubject('');
    setClasse('');
    setRoom('');
    setLocation('');
  };

  return (
    <Box sx={{ flexGrow: 1, marginTop: 5 }}>
      <form onSubmit={handleSubmit}>
        <FormControl sx={{ m: 1, minWidth: 220 }} size="small">
          <Autocomplete
            sx={{ width: 220 }}
            value={tutor}
            onChange={(event, newValue) => {
              setTutor(newValue.label);
            }}
            inputValue={inputTutorValue}
            onInputChange={(event, newInputValue) => {
              setInputTutorValue(newInputValue);
            }}
            id="controllable-states"
            // options={options}
            isOptionEqualToValue={(option, value) =>
              option.label === value.label
            }
            renderOption={(props, option) => (
              <Box
                component="li"
                sx={{ '& > img': { mr: 2, flexShrink: 0 } }}
                {...props}>
                {option.label}
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tuteur"
                size="small"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            )}
          />
        </FormControl>

        <FormControl sx={{ m: 1, minWidth: 220 }} size="small">
          <Autocomplete
            value={student}
            onChange={(event, newValue) => {
              setStudent(newValue);
            }}
            inputValue={inputStudentValue}
            onInputChange={(event, newInputValue) => {
              setInputStudentValue(newInputValue);
            }}
            id="controllable-states"
            options={studentsfakeFullNames}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            sx={{ width: 220 }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Elève"
                size="small"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            )}
          />
        </FormControl>
        <FormControl sx={{ m: 1, minWidth: 220 }} size="small">
          <InputLabel shrink>Classe</InputLabel>
          <Select
            label="Classe"
            value={classe}
            onChange={(e) => setClasse(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}>
            {existingClasses.map((classe) => (
              <MenuItem key={classe} value={classe}>
                {classe}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ m: 1, minWidth: 220 }} size="small">
          <InputLabel shrink>Matière</InputLabel>
          <Select
            label="Matière"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}>
            {existingSubjects.map((subject) => (
              <MenuItem key={subject} value={subject}>
                {subject}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
          <InputLabel shrink>Jour</InputLabel>
          <Select
            label="Jour"
            value={day}
            onChange={(e) => setDay(e.target.value)}>
            {days.map((day) => (
              <MenuItem key={day} value={day}>
                {day}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ m: 1, minWidth: 120 }}>
          {/* <InputLabel>Horaire</InputLabel> */}
          <TextField
            type="time"
            value={timeStart}
            onChange={(e) => setTimeStart(e.target.value)}
            size="small"
            label="Horaire début"
            variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
          />
        </FormControl>
        <FormControl sx={{ m: 1, minWidth: 120 }}>
          {/* <InputLabel>Horaire</InputLabel> */}
          <TextField
            type="time"
            value={timeEnd}
            onChange={(e) => setTimeEnd(e.target.value)}
            size="small"
            label="Horaire fin"
            variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
          />
        </FormControl>

        <FormControl sx={{ m: 1, minWidth: 320 }} size="small">
          <InputLabel shrink>Lieu</InputLabel>
          <Select
            label="lieu"
            value={location}
            onChange={(e) => setLocation(e.target.value)}>
            {existingLocations.map((location) => (
              <MenuItem key={location} value={location}>
                {location}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ m: 1, minWidth: 220 }} size="small">
          <InputLabel shrink>Salle</InputLabel>
          <Select
            label="Salle"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}>
            {existingRooms.map((room) => (
              <MenuItem key={room} value={room}>
                {room}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ m: 1, minWidth: 120 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ height: 40 }}>
            Créer le cours
          </Button>
        </FormControl>
      </form>
    </Box>
  );
};

export default CreateCourseForm;
