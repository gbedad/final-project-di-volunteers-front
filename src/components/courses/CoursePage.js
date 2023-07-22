import React, { useState, useContext } from 'react';
import { faker, id_ID } from '@faker-js/faker';
import { CourseProvider, useValue } from './CourseContext';
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Box,
  Autocomplete,
} from '@mui/material';
import {
  DataGrid,
  GridRowModes,
  GridActionsCellItem,
  GridRowsProp,
  GridColDef,
  GridCellParams,
  GridEditCellPropsParams,
} from '@mui/x-data-grid';

import {
  existingSubjects,
  existingLocations,
  existingRooms,
  existingClasses,
} from '../../options/existingOptions';
import { calculateTimeDifference } from '../../js/getTimeDifference';
import InstancesPage from './InstancesPage';

import CreateCourseForm from './CourseCreateForm';
import CoursesActions from './CoursesActions';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';

import { generateTruncatedHash } from '../../js/generateUniqueId';

// Mock data for select options
const tutorsfakeFullNames = Array.from({ length: 120 }, () => {
  return {
    userId: faker.person.uuid,
    tut: `${faker.person.firstName()} ${faker.person.lastName()}`,
  };
});

console.log(tutorsfakeFullNames);
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

// const tutors = ['Tutor 1', 'Tutor 2', 'Tutor 3'];
const students = ['Student 1', 'Student 2', 'Student 3'];
const subjects = ['Math', 'Science', 'History'];
const locations = ['Location 1', 'Location 2', 'Location 3'];

const tutor_users = JSON.parse(localStorage.getItem('users'));

let tutors = [];
tutor_users.map((item, index) => {
  return tutors.push({
    tutorId: item.id,
    fullname: `${item.first_name} ${item.last_name}`,
  });
});

// const options = tutor_users.map((item) => ({
//   value: `${item.first_name} ${item.last_name}`,
//   label: `${item.first_name} ${item.last_name}`,
//   key: item.id, // Assuming 'item.id' is a unique identifier for each tutor
// }));

const options = tutors.map((tutorUser) => ({
  userid: tutorUser.tutorId,
  label: tutorUser.fullname,
}));

console.log(options);

// const CreateCourseForm = ({ onCourseCreate }) => {
//   const [day, setDay] = useState('');
//   const [timeStart, setTimeStart] = useState('');
//   const [timeEnd, setTimeEnd] = useState('');
//   const [tutor, setTutor] = useState('');
//   const [student, setStudent] = useState('');
//   const [subject, setSubject] = useState('');
//   const [classe, setClasse] = useState('');
//   const [location, setLocation] = useState('');
//   const [room, setRoom] = useState('');
//   const [inputTutorValue, setInputTutorValue] = React.useState('');
//   const [inputStudentValue, setInputStudentValue] = React.useState('');

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const course = {
//       tutor,
//       student,
//       subject,
//       classe,
//       location,
//       room,
//       day,
//       timeStart,
//       timeEnd,
//       instances: [], // Initialize instances array for the course
//     };
//     onCourseCreate(course);
//     setDay('');
//     setTimeStart('');
//     setTimeEnd('');
//     setTutor('');
//     setStudent('');
//     setSubject('');
//     setClasse('');
//     setRoom('');
//     setLocation('');

//   };

//   console.log(timeStart, timeEnd);

//   return (
//     <Box sx={{ flexGrow: 1, marginTop: 5 }}>
//       <form onSubmit={handleSubmit}>
//         {/* <FormControl sx={{ m: 1, minWidth: 220 }}>
//           <TextField
//             value={code}
//             onChange={(e) => setCode(e.target.value)}
//             size="small"
//             label="Course code"
//             variant="outlined"
//           />
//         </FormControl> */}
//         {/* <FormControl sx={{ m: 1, minWidth: 220 }} size="small">
//           <InputLabel>Tutor</InputLabel>
//           <Select
//             label="Tutor"
//             value={tutor}
//             onChange={(e) => setTutor(e.target.value)}
//             variant="outlined">
//             {tutors.map((tutor) => (
//               <MenuItem key={tutor} value={tutor}>
//                 {tutor}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl> */}
//         <FormControl sx={{ m: 1, minWidth: 220 }} size="small">
//           <Autocomplete
//             sx={{ width: 220 }}
//             value={tutor}
//             onChange={(event, newValue) => {
//               setTutor(newValue.label);
//             }}
//             inputValue={inputTutorValue}
//             onInputChange={(event, newInputValue) => {
//               setInputTutorValue(newInputValue);
//             }}
//             id="controllable-states"
//             options={options}
//             isOptionEqualToValue={(option, value) =>
//               option.label === value.label
//             }
//             renderOption={(props, option) => (
//               <Box
//                 component="li"
//                 sx={{ '& > img': { mr: 2, flexShrink: 0 } }}
//                 {...props}>
//                 {option.label}
//               </Box>
//             )}
//             renderInput={(params) => (
//               <TextField
//                 {...params}
//                 label="Tuteur"
//                 size="small"
//                 InputLabelProps={{
//                   shrink: true,
//                 }}
//               />
//             )}
//           />
//         </FormControl>

//         <FormControl sx={{ m: 1, minWidth: 220 }} size="small">
//           <Autocomplete
//             value={student}
//             onChange={(event, newValue) => {
//               setStudent(newValue);
//             }}
//             inputValue={inputStudentValue}
//             onInputChange={(event, newInputValue) => {
//               setInputStudentValue(newInputValue);
//             }}
//             id="controllable-states"
//             options={studentsfakeFullNames}
//             isOptionEqualToValue={(option, value) => option.id === value.id}
//             sx={{ width: 220 }}
//             renderInput={(params) => (
//               <TextField
//                 {...params}
//                 label="Elève"
//                 size="small"
//                 InputLabelProps={{
//                   shrink: true,
//                 }}
//               />
//             )}
//           />
//         </FormControl>
//         <FormControl sx={{ m: 1, minWidth: 220 }} size="small">
//           <InputLabel shrink>Classe</InputLabel>
//           <Select
//             label="Classe"
//             value={classe}
//             onChange={(e) => setClasse(e.target.value)}
//             InputLabelProps={{
//               shrink: true,
//             }}>
//             {existingClasses.map((classe) => (
//               <MenuItem key={classe} value={classe}>
//                 {classe}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>

//         <FormControl sx={{ m: 1, minWidth: 220 }} size="small">
//           <InputLabel shrink>Matière</InputLabel>
//           <Select
//             label="Matière"
//             value={subject}
//             onChange={(e) => setSubject(e.target.value)}
//             InputLabelProps={{
//               shrink: true,
//             }}>
//             {existingSubjects.map((subject) => (
//               <MenuItem key={subject} value={subject}>
//                 {subject}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>
//         <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
//           <InputLabel shrink>Jour</InputLabel>
//           <Select
//             label="Jour"
//             value={day}
//             onChange={(e) => setDay(e.target.value)}>
//             {days.map((day) => (
//               <MenuItem key={day} value={day}>
//                 {day}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>
//         <FormControl sx={{ m: 1, minWidth: 120 }}>
//           {/* <InputLabel>Horaire</InputLabel> */}
//           <TextField
//             type="time"
//             value={timeStart}
//             onChange={(e) => setTimeStart(e.target.value)}
//             size="small"
//             label="Horaire début"
//             variant="outlined"
//             InputLabelProps={{
//               shrink: true,
//             }}
//           />
//         </FormControl>
//         <FormControl sx={{ m: 1, minWidth: 120 }}>
//           {/* <InputLabel>Horaire</InputLabel> */}
//           <TextField
//             type="time"
//             value={timeEnd}
//             onChange={(e) => setTimeEnd(e.target.value)}
//             size="small"
//             label="Horaire fin"
//             variant="outlined"
//             InputLabelProps={{
//               shrink: true,
//             }}
//           />
//         </FormControl>

//         <FormControl sx={{ m: 1, minWidth: 320 }} size="small">
//           <InputLabel shrink>Lieu</InputLabel>
//           <Select
//             label="lieu"
//             value={location}
//             onChange={(e) => setLocation(e.target.value)}>
//             {existingLocations.map((location) => (
//               <MenuItem key={location} value={location}>
//                 {location}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>
//         <FormControl sx={{ m: 1, minWidth: 220 }} size="small">
//           <InputLabel shrink>Salle</InputLabel>
//           <Select
//             label="Salle"
//             value={room}
//             onChange={(e) => setRoom(e.target.value)}
//             InputLabelProps={{
//               shrink: true,
//             }}>
//             {existingRooms.map((room) => (
//               <MenuItem key={room} value={room}>
//                 {room}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>
//         <FormControl sx={{ m: 1, minWidth: 120 }}>
//           <Button
//             type="submit"
//             variant="contained"
//             color="primary"
//             sx={{ height: 40 }}>
//             Créer le cours
//           </Button>
//         </FormControl>
//       </form>
//     </Box>
//   );
// };

const UpdateCourseForm = ({ instance, onUpdate }) => {
  const [room, setRoom] = useState(instance.room || '');
  const [datetime, setDatetime] = useState(instance.datetime || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(instance.id, room, datetime);
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Room"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
      />

      <TextField
        label="Date and Time"
        type="datetime-local"
        value={datetime}
        onChange={(e) => setDatetime(e.target.value)}
      />

      <Button type="submit" variant="contained" color="primary">
        Update Course
      </Button>
    </form>
  );
};

const CourseList = ({ courses, handleCourseUpdate, handleInstanceCreate }) => {
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [rowModesModel, setRowModesModel] = React.useState({});
  const { dispatch } = useValue();

  const handleRowClick = (courseId) => {
    setSelectedCourseId(courseId);
  };

  const handleInstanceCreateClick = (courseId, room, datetime) => {
    handleInstanceCreate(courseId, room, datetime);
    setSelectedCourseId(null);
  };
  // new
  //==========
  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };
  const handleSaveClick = (id, params) => () => {
    dispatch({ type: 'UPDATE_COURSE', payload: [id] });
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };
  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
    // const editedRow = rows.find((row) => row.id === id);
    // if (editedRow.isNew) {
    //   setRows(rows.filter((row) => row.id !== id));
    // }
  };
  const handleDeleteClick = (id) => () => {
    dispatch({
      type: 'DELETE_COURSE',
      payload: id,
    });
    // setRows(rows.filter((row) => row.id !== id));
  };
  //=========
  // console.log(courses);
  const rows = courses;

  const columns = [
    { field: 'id', headerName: 'Course Id', width: 150 },

    {
      field: 'subject',
      headerName: 'Matière',
      width: 250,
      editable: true,
      type: 'singleSelect',
      valueOptions: existingSubjects,
    },
    {
      field: 'classe',
      headerName: 'Classe',
      width: 150,
      editable: true,
      type: 'singleSelect',
      valueOptions: existingClasses,
    },
    { field: 'tutor', headerName: 'Tuteur', width: 250, editable: true },
    { field: 'student', headerName: 'Elève', width: 250, editable: true },
    {
      field: 'day',
      headerName: 'Jour prévu',
      width: 150,
      editable: true,
      type: 'singleSelect',
      valueOptions: days,
    },
    {
      field: 'timeStart',
      headerName: 'Heure début',
      type: 'time',
      width: 150,
      editable: true,
    },
    { field: 'timeEnd', headerName: 'Heure fin', width: 150, editable: true },
    {
      field: 'duration',
      headerName: 'Durée',
      valueGetter: (params) => {
        return `${
          calculateTimeDifference(params.row.timeStart, params.row.timeEnd)
            .hours
        }:${
          calculateTimeDifference(params.row.timeStart, params.row.timeEnd)
            .minutes
        }`;
      },
    },
    { field: 'room', headerName: 'Salle', width: 150, editable: true },
    {
      field: 'location',
      headerName: 'Lieu',
      width: 300,
      editable: true,
      type: 'singleSelect',
      valueOptions: existingLocations,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              sx={{
                color: 'primary.main',
              }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },

    // {
    //   field: 'actions',
    //   headerName: 'Actions',
    //   type: 'actions',
    //   width: 100,
    //   renderCell: (params) => (
    //     <CoursesActions
    //       {...{ params }}
    //       onClick={() => {
    //         params.api.setRowMode(params.row.id, 'edit');
    //       }}
    //       sx={{ cursor: 'pointer' }}
    //     />
    //   ),
    // },
  ];

  // Edit cells
  const handleCellEditCommit = (params) => {
    const updatedRows = [...rows];
    updatedRows[params.id - 1] = {
      ...updatedRows[params.id - 1],
      [params.field]: params.value,
    };
    // setRows(updatedRows);
  };

  return (
    <div>
      <h2>Tous les cours</h2>
      <div style={{ height: 300, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          rowModesModel={rowModesModel}
          editMode="row"
          disableSelectionOnClick
        />
      </div>
      {/* <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Course Id</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Tutor</TableCell>
              <TableCell>Student</TableCell>
              <TableCell>Location</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((course) => (
              <TableRow
                key={course.id}
                onClick={() => handleRowClick(course.id)} // Add onClick event listener
                style={{
                  cursor: 'pointer',
                  backgroundColor:
                    selectedCourseId === course.id ? 'lightgray' : 'inherit',
                }}>
                <TableCell>{course.id}</TableCell>
                <TableCell>{course.subject}</TableCell>
                <TableCell>{course.tutor}</TableCell>
                <TableCell>{course.student}</TableCell>
                <TableCell>{course.location}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer> */}
      {/* {selectedCourseId && (
        <div>
          <h3>Selected Course</h3>
          {courses.map((course) => {
            if (course.id === selectedCourseId) {
              return (
                <div key={course.id}>
                  {course.instances.map((instance) => (
                    <div key={instance.id}>
                      {instance.room && <p>Room: {instance.room}</p>}
                      {instance.datetime && (
                        <p>Date and Time: {instance.datetime}</p>
                      )}
                      <UpdateCourseForm
                        instance={instance}
                        onUpdate={(roomId, datetime) =>
                          handleCourseUpdate(
                            course.id,
                            instance.id,
                            roomId,
                            datetime
                          )
                        }
                      />
                    </div>
                  ))}
                  <CreateInstanceForm
                    courseId={course.id}
                    onInstanceCreate={handleInstanceCreateClick}
                  />
                </div>
              );
            }
            return null;
          })}
        </div>
      )} */}
    </div>
  );
};

// const CreateInstanceForm = ({ courseId, onInstanceCreate }) => {
//   const [room, setRoom] = useState('');
//   const [datetime, setDatetime] = useState('');

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onInstanceCreate(courseId, room, datetime);
//     setRoom('');
//     setDatetime('');
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <TextField
//         label="Room"
//         value={room}
//         onChange={(e) => setRoom(e.target.value)}
//       />

//       <TextField
//         label="Date and Time"
//         type="datetime-local"
//         value={datetime}
//         onChange={(e) => setDatetime(e.target.value)}
//       />

//       <Button type="submit" variant="contained" color="primary">
//         Add Instance
//       </Button>
//     </form>
//   );
// };

const CreateInstanceForm = ({ courses, onInstanceCreate }) => {
  const { dispatch } = useValue();
  console.log('=====>', courses);
  const handleInstancesCreate = () => {
    const currentDate = new Date();
    const nextWeekStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() + (7 - currentDate.getDay()) + 1
    ); // Get the next week's starting date (Monday)
    console.log(nextWeekStart.toLocaleDateString());

    function getNextDay(day) {
      const currentDate = new Date();
      const currentDay = currentDate.getDay();
      const daysToAdd = (day - currentDay + 7) % 7;

      const nextDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() + daysToAdd
      );

      return nextDay;
    }

    function getDayNumber(day) {
      switch (day) {
        case 'Lundi':
          return 1;
        case 'Mardi':
          return 2;
        case 'Mercredi':
          return 3;
        case 'Jeudi':
          return 4;
        case 'Vendredi':
          return 5;
        case 'Samedi':
          return 6;
        case 'Dimanche':
          return 0;

        default:
          break;
      }
    }

    const coursesInstances = courses.map((course) => {
      const isDateNotInArray = !course.instances.some(
        (event) =>
          event.datetime ===
          getNextDay(getDayNumber(course.day)).toLocaleDateString()
      );
      if (isDateNotInArray) {
        const newInstance = {
          id: generateTruncatedHash(8), // Generate unique ID for the instance
          courseId: course.id,
          tutor: course.tutor,
          student: course.student,
          subject: course.subject,
          location: course.location,
          room: course.room,
          datetime: getNextDay(getDayNumber(course.day)).toLocaleDateString(), // Set the datetime for the next week based on course day
          startTime: course.timeStart,
          endTime: course.timeEnd,
        };

        return {
          ...course,
          instances: [...course.instances, newInstance],
        };
      }

      // if (course.id === courseId) {
      //   const newInstance = {
      //     id: Date.now(), // Generate unique ID for the instance
      //     room,
      //     datetime,
      //   };
      //   return {
      //     ...course,
      //     instances: [...course.instances, newInstance],
      //   };
      // }
      // return course;
    });
    console.log(coursesInstances);

    coursesInstances.forEach((element) => {
      console.log(element);
      dispatch({ type: 'UPDATE_COURSE', payload: element.id });
    });
  };

  //   console.log(nextWeekInstances);
  //   nextWeekInstances.forEach((newInstance) => {
  //     onInstanceCreate(newInstance);
  //   });
  // };

  return (
    <div>
      <h3>Create Instances</h3>
      <Button
        variant="contained"
        color="primary"
        onClick={handleInstancesCreate}>
        Create Instances
      </Button>
    </div>
  );
};

const CoursePage = () => {
  // const [courses, setCourses] = useState([]);
  const { dispatch, courses } = useValue();
  // const handleCourseCreate = (course) => {
  //   const newCourse = {
  //     ...course,
  //     id: Date.now(), // Generate unique ID for the course
  //     instances: [], // Initialize instances array for the course
  //   };
  //   setCourses((prevCourses) => [...prevCourses, newCourse]);
  // };

  const handleCourseCreate = (course) => {
    dispatch({ type: 'ADD_COURSE', payload: course });
  };

  // const handleCourseUpdate = (courseId, instanceId, room, datetime) => {
  //   setCourses((prevCourses) =>
  //     prevCourses.map((course) => {
  //       if (course.id === courseId) {
  //         const updatedInstances = course.instances.map((instance) => {
  //           if (instance.id === instanceId) {
  //             return {
  //               ...instance,
  //               room,
  //               datetime,
  //             };
  //           }
  //           return instance;
  //         });
  //         return {
  //           ...course,
  //           instances: updatedInstances,
  //         };
  //       }
  //       return course;
  //     })
  //   );
  // };

  //   const handleInstanceCreate = (courseId, room, datetime) => {
  //     setCourses((prevCourses) =>
  //       prevCourses.map((course) => {
  //         if (course.id === courseId) {
  //           const newInstance = {
  //             id: Date.now(), // Generate unique ID for the instance
  //             room,
  //             datetime,
  //           };
  //           return {
  //             ...course,
  //             instances: [...course.instances, newInstance],
  //           };
  //         }
  //         return course;
  //       })
  //     );
  //   };
  // const handleInstanceCreate = (newInstance) => {
  //   const { courseId } = newInstance;

  //   const updatedCourses = courses.map((course) => {
  //     if (course.id === courseId) {
  //       const updatedInstances = course.instances
  //         ? [...course.instances, newInstance]
  //         : [newInstance];

  //       return {
  //         ...course,
  //         instances: updatedInstances,
  //       };
  //     }

  //     return course;
  //   });

  //   setCourses(updatedCourses);
  //   const createdInstances = localStorage.setItem(
  //     'instances',
  //     JSON.stringify(courses)
  //   );
  // };

  const handleCourseUpdate = (courseId, instanceId, room, datetime) => {
    dispatch({
      type: 'UPDATE_COURSE',
      payload: {
        courseId,
        instanceId,
        room,
        datetime,
      },
    });
  };

  const handleInstanceCreate = (newInstance) => {
    dispatch({ type: 'ADD_INSTANCE', payload: newInstance });
  };

  return (
    <div>
      {/* <CreateCourseForm onCourseCreate={handleCourseCreate} /> */}

      <CourseList
        courses={courses}
        handleCourseUpdate={handleCourseUpdate}
        // handleInstanceCreate={handleInstanceCreate}
      />
      <CreateInstanceForm
        courses={courses}
        onInstanceCreate={handleInstanceCreate}
      />
      <InstancesPage />
    </div>
  );
};

export default CoursePage;
