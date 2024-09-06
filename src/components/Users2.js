import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import {
  Box,
  Stack,
  Button,
  Autocomplete,
  TextField,
  Chip,
} from '@mui/material';

import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  GRID_CHECKBOX_SELECTION_COL_DEF,
} from '@mui/x-data-grid';
import FullEditDataGrid from 'mui-datagrid-full-edit';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

import TypeSpecimenRoundedIcon from '@mui/icons-material/TypeSpecimenRounded';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

import Rating from '@mui/material/Rating';
import FilePresentOutlinedIcon from '@mui/icons-material/FilePresentOutlined';
import FilePresentRoundedIcon from '@mui/icons-material/FilePresentRounded';
import DoneIcon from '@mui/icons-material/Done';
import MessageIcon from '@mui/icons-material/Message';
// import PersonPinIcon from '@mui/icons-material/PersonPin';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import CallIcon from '@mui/icons-material/Call';
import LooksOneIcon from '@mui/icons-material/LooksOne';
import LooksTwoIcon from '@mui/icons-material/LooksTwo';
import Looks3Icon from '@mui/icons-material/Looks3';
import Filter3Icon from '@mui/icons-material/Filter3';
import {
  existingDays,
  existingSubjects,
  existingTimes,
  existingLevels,
} from '../options/existingOptions';

import { formatPhoneNumber } from '../js/phoneNumbersSpace';
import { parsePhoneNumber } from 'awesome-phonenumber';

const StyledRating = styled(Rating)({
  '& .MuiRating-iconFilled': {
    color: '#ff6d75',
  },
  '& .MuiRating-iconHover': {
    color: '#ff3d47',
  },
});
const subjects = existingSubjects;
const days = existingDays;
const times = existingTimes;
const levels = JSON.parse(existingLevels);

// function createData(
//   id,
//   first_name,
//   last_name,
//   email,
//   phone,
//   mission,
//   mission_location,
//   skill,
//   created_at,
//   status,
//   is_active,
//   trueValuesCount,
//   test_voltaire_passed,
//   convention_received,
//   nb_interviews
// ) {
//   return {
//     id,
//     first_name,
//     last_name,
//     email,
//     phone,
//     mission,
//     mission_location,
//     skill,
//     created_at,
//     status,
//     is_active,
//     trueValuesCount,
//     test_voltaire_passed,
//     convention_received,
//     nb_interviews,
//   };
// }

export default function DataGridDemo(props) {
  const navigate = useNavigate();
  const location = useLocation();

  const users = props.data;
  // const userList = localStorage.setItem('users', JSON.stringify(users));
  // console.log(users);
  // const [users, setUsers] = useState([])
  // eslint-disable-next-line
  const [selectedUser, setSelectedUser] = useState(null);
  // const [dataActive, setDataActive] = useState([]);
  // const [activeUsers, setActiveUsers] = useState(null);
  // const [countUsersByStatus, setCountUsersByStatus] = useState({});
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedTimeStart, setSelectedTimeStart] = useState('');
  const [selectedTimeEnd, setSelectedTimeEnd] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  // const [value, setValue] = React.useState(subjects[0]);
  const [inputSubjectValue, setInputSubjectValue] = React.useState('');
  const [inputLevelValue, setInputLevelValue] = React.useState('');
  const [inputDayValue, setInputDayValue] = React.useState('');
  const [inputTimeStartValue, setInputTimeStartValue] = React.useState('');
  const [inputTimeEndValue, setInputTimeEndValue] = React.useState('');

  const [rows, setRows] = useState([]);
  const [newMessageFlags, setNewMessageFlags] = useState({});
  const [justViewedMessages, setJustViewedMessages] = useState(false);
  const [loading, setLoading] = useState(false);

  const columns = [
    {
      ...GRID_CHECKBOX_SELECTION_COL_DEF,
      hideable: true,
    },
    { field: 'id', headerName: 'ID', width: 90, hideable: true },
    {
      field: 'created_at',
      headerName: 'Inscription',
      width: '150',
      hideable: true,
      valueFormatter: (params) => {
        if (!params.value) return '';
        return new Date(params.value).toLocaleDateString();
      },
    },
    {
      field: 'hasNewMessage',
      headerName: 'Fil ',
      width: 80,
      renderCell: (params) => {
        return newMessageFlags[params.row.id] ? (
          // <Chip label="New" color="primary" />
          <MessageIcon color="primary" />
        ) : null;
      },
    },
    {
      field: 'first_name',
      headerName: 'Prénom',
      width: 150,
      editable: true,
    },
    {
      field: 'last_name',
      headerName: 'Nom',
      width: 150,
      editable: true,
    },
    // {
    //   field: 'fullName',
    //   headerName: 'Nom',
    //   description: 'This column has a value getter and is not sortable.',
    //   sortable: false,
    //   width: 220,
    //   valueGetter: (params) =>
    //     `${params.row.first_name || ''} ${params.row.last_name || ''}`,
    // },
    {
      field: 'email',
      headerName: 'Email',

      width: 250,
      editable: true,
    },
    {
      field: 'phone',
      headerName: 'Téléphone',
      valueGetter: (params) =>
        params.row.phone
          ? `${parsePhoneNumber(params.row.phone).number.international}`
          : '',

      width: 150,
      editable: true,
    },
    {
      field: 'mission',
      headerName: 'Mission',
      valueFormatter: (params) => {
        if (params.value) {
          return params.value.replace(/^TUTORAT\s*/i, '').trim();
        }
        return '';
      },
      width: 150,
      editable: true,
    },
    // {
    //   field: 'mission_location',
    //   headerName: 'Lieu',

    //   width: 150,
    //   editable: true,
    // },
    // {
    //   field: 'skill',
    //   headerName: 'Matières',
    //   width: 300,
    //   type: 'singleSelect',
    //   // valueOptions: [...new Set(rows.map((o) => o.skill).flat())],
    //   renderCell: (params) => (
    //     <Stack direction="row" spacing={0.25}>
    //       {params.value.skill.map((topic) => (
    //         <Chip label={topic.subject} />
    //       ))}
    //     </Stack>
    //   ),
    // },

    {
      field: 'status',
      headerName: 'Statut',

      width: 110,
      editable: true,
    },
    {
      field: 'is_available',
      headerName: 'Disponible',

      width: 100,
      editable: true,
      align: 'center',
      renderCell: (params) => {
        return params.value ? (
          <EventAvailableIcon
            style={{
              color: 'yellowGreen',
            }}
          />
        ) : (
          ''
        );
      },
    },
    {
      field: 'first_contact',
      headerName: 'Call',
      editable: true,
      renderCell: (params) => {
        return params.value ? (
          <CallIcon
            style={{
              color: 'primary',
            }}
          />
        ) : (
          ''
        );
      },
    },
    {
      field: 'nb_interviews',
      headerName: 'Entretiens',

      width: 80,
      editable: true,
      align: 'center',
      renderCell: (params) => {
        return params.value === 1 ? (
          <LooksOneIcon
            style={{
              color: 'primary',
            }}
          />
        ) : params.value === 2 ? (
          <LooksTwoIcon
            style={{
              color: 'primary',
            }}
          />
        ) : params.value === 3 ? (
          <Looks3Icon
            style={{
              color: 'primary',
            }}
          />
        ) : (
          ''
        );
      },
    },
    {
      field: 'trueValuesCount',
      headerName: 'Documents',

      width: 130,
      editable: true,
      renderCell: renderRating,
    },
    {
      field: 'test_voltaire_passed',
      headerName: 'Test',

      width: 70,
      editable: true,
    },
    {
      field: 'convention_received',
      headerName: 'Convention',

      width: 100,

      renderCell: (params) => {
        return params.value ? (
          <ReceiptLongIcon
            style={{
              color: 'purple',
            }}
          />
        ) : (
          ''
        );
      },
    },
    {
      field: 'is_active',
      headerName: 'Actif',

      width: 70,
      editable: true,
      align: 'center',
      renderCell: (params) => {
        return params.value ? (
          <VerifiedUserIcon
            style={{
              color: 'green',
            }}
          />
        ) : (
          ''
        );
      },
    },
  ];
  // function CustomToolbar() {
  //   return (
  //     <GridToolbarContainer>
  //       <GridToolbarExport />
  //     </GridToolbarContainer>
  //   );
  // }

  function renderRating(params) {
    return (
      <StyledRating
        readOnly
        value={params.value}
        getLabelText={(value) =>
          `${value} ArticleIcon${value !== 1 ? 's' : ''}`
        }
        icon={<FilePresentRoundedIcon fontSize="10" />}
        emptyIcon={<FilePresentOutlinedIcon />}
        max={3}
      />
    );
  }

  // const [page, setPage] = React.useState(0);
  // const [rowsPerPage, setRowsPerPage] = React.useState(10);

  // const handleSubjectChange = (event) => {
  //   setSelectedSubject(event.target.value);
  // };
  // console.log(selectedSubject);
  // ===================================================================================================
  // function filterBySubject(users, subject) {
  //   return users.filter((user) => {
  //     const topics = user.skill?.topics || []; // Access the topics array and handle the case when it is undefined or null

  //     return topics.some((topic) =>
  //       JSON.parse(topic).subject.includes(subject)
  //     );
  //   });
  // }
  // const handleSearch = () => {
  //   const filteredResults = filterBySubject(
  //     cleanedArray,
  //     selectedSubject.label
  //   );
  //   if (filteredResults.length > 0) {
  //     setFilteredData(filteredResults);
  //   } else {
  //     setFilteredData([]);
  //   }
  // };
  // ===================================================================================================

  function filterUsers(users, filters) {
    return users.filter((user) => {
      const topics = user.skill?.topics || [];
      const daytimes = user.skill?.when_day_slot || [];

      // Subject filter
      const subjectMatch =
        !filters.subject ||
        topics.some((topic) =>
          JSON.parse(topic).subject.includes(filters.subject)
        );

      // Level filter
      const levelMatch =
        !filters.level ||
        topics.some((topic) => {
          const startIndex = levels.findIndex(
            (level) => level.label === JSON.parse(topic).classStart
          );
          const endIndex = levels.findIndex(
            (level) => level.label === JSON.parse(topic).classEnd
          );
          console.log('Start Index:', startIndex, 'End Index:', endIndex);
          if (startIndex === -1 || endIndex === -1) {
            console.error('Invalid classStart or classEnd');
            return false;
          }
          // Create an array of levels between classStart and classEnd
          const levelsInRange = levels
            .slice(startIndex, endIndex + 1)
            .map((level) => level.label);
          console.log('Levels in range:', levelsInRange);
          // Check if the filteredLevel is in the levelsInRange array
          return levelsInRange.includes(filters.level);
        });

      // Day filter
      const dayMatch =
        !filters.day ||
        daytimes.some((daytime) =>
          JSON.parse(daytime).day.includes(filters.day)
        );

      // Time range filter
      const timeMatch =
        !filters.timeStart ||
        !filters.timeEnd ||
        daytimes.some((daytime) => {
          const start = new Date(`1970-01-01T${JSON.parse(daytime).startTime}`);
          const end = new Date(`1970-01-01T${JSON.parse(daytime).endTime}`);
          const filterStart = new Date(`1970-01-01T${filters.timeStart}`);
          const filterEnd = new Date(`1970-01-01T${filters.timeEnd}`);

          return start <= filterEnd && end >= filterStart;
        });

      return subjectMatch && levelMatch && dayMatch && timeMatch;
    });
  }

  const handleSearch = () => {
    const filters = {
      subject: selectedSubject ? selectedSubject['label'] : null,
      level: selectedLevel ? selectedLevel['label'] : null,
      day: selectedDay ? selectedDay['label'] : null,
      timeStart: selectedTimeStart ? selectedTimeStart['label'] : null,
      timeEnd: selectedTimeEnd ? selectedTimeEnd['label'] : null,
    };
    console.log(filters.timeEnd);

    const filteredResults = filterUsers(cleanedArray, filters);

    if (filteredResults.length > 0) {
      setFilteredData(filteredResults);
    } else {
      setFilteredData([]);
    }
  };

  if (document.getElementsByClassName('MuiAutocomplete-clearIndicator')[0]) {
    const close = document.getElementsByClassName(
      'MuiAutocomplete-clearIndicator'
    )[0];
    close.addEventListener('click', () => {
      handleResetFilter();
    });
  }

  const handleResetFilter = () => {
    setFilteredData(cleanedArray);
  };

  useEffect(() => {
    handleResetFilter();
    // eslint-disable-next-line
  }, [users]);
  // console.log("location====>>>", location);
  // Generate Order Data
  // Effect to check for new messages
  useEffect(() => {
    const updatedFlags = {};
    filteredData.forEach((item) => {
      const lastViewedCount =
        parseInt(localStorage.getItem(`lastViewedCount_${item.id}`)) || 0;
      const currentCount = Array.isArray(item.internal_thread)
        ? item.internal_thread.length
        : 0;

      if (currentCount > lastViewedCount) {
        updatedFlags[item.id] = true;
      }
    });

    setNewMessageFlags((prev) => ({ ...prev, ...updatedFlags }));
  }, [filteredData, justViewedMessages]);

  const handleRowClick = useCallback(
    (params) => {
      const userId = params.row.id;
      // If there was a new message flag, remove it
      if (newMessageFlags[userId]) {
        setNewMessageFlags((prev) => ({ ...prev, [userId]: false }));
      }

      // Update last viewed count in local storage
      const currentUser = filteredData.find((item) => item.id === userId);
      if (currentUser && currentUser.internal_thread) {
        localStorage.setItem(
          `lastViewedCount_${userId}`,
          currentUser.internal_thread.length.toString()
        );
      }

      setJustViewedMessages(true);

      setSelectedUser(params.row.id);
      navigate('/admin/change-status', {
        state: { userId: params.row.id, userLogged: location.state.userLogged },
      });
    },
    [filteredData, newMessageFlags, navigate, location.state]
  );

  // Reset justViewedMessages when returning to this component
  useEffect(() => {
    setJustViewedMessages(false);
  }, []);

  const calculateTrueValues = (users) => {
    console.log(users.length);

    return users.map((user) => {
      const trueValues = [
        user.id_received,
        user.cv_received,
        user.b3_received,
        // user.convention_received,
      ].filter((value) => value === true);
      return { ...user, trueValuesCount: trueValues.length };
    });
  };
  const usersWithTrueValuesCount = calculateTrueValues(users);

  const updateTopicsToEmptyArray = (data) => {
    return data.map((item) => {
      if (item.skill === null) {
        return { ...item, skill: [] };
      }
      return item;
    });
  };
  let cleanedArray = updateTopicsToEmptyArray(usersWithTrueValuesCount);
  // console.log(usersWithTrueValuesCount);
  // cleanedArray = filteredData;
  // if (filteredData.length > 0) {
  //   cleanedArray = filteredData;
  // }
  // console.log(filteredData);

  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  // const rows = filteredData
  //   .map((item, key = item.id) => {
  //     let prevCount = prevMessageCountsRef[item.id] || 0;

  //     console.log(prevCount);
  //     const nb_messages = Array.isArray(item.internal_thread)
  //       ? item.internal_thread.length
  //       : 0;
  //     let hasNewMessage = nb_messages > prevCount;

  //     console.log('nb messages', nb_messages, hasNewMessage);

  //     //
  //     prevMessageCountsRef[item.id] = nb_messages;

  //     const nb_interviews = Array.isArray(item.interviews)
  //       ? item.interviews.filter((element) => JSON.parse(element).isActive)
  //           .length
  //       : 0;
  //     const first_contact = item.pre_interview
  //       ? JSON.parse(item.pre_interview).isActive
  //       : null;

  //     // console.log(item.pre_interview ? item.pre_interview : null);
  //     // console.log(nb_interviews);
  //     if (item.mission === null) {
  //       return [];
  //     }

  //     return createData(
  //       item.id,
  //       hasNewMessage,
  //       item.first_name,
  //       item.last_name,
  //       item.email,
  //       item.phone,
  //       item.mission.title || null,
  //       item.mission.location || null,
  //       item.skill,
  //       item.created_at,
  //       item.status,
  //       item.is_active,
  //       first_contact,
  //       nb_interviews,
  //       item.trueValuesCount,
  //       item.test_voltaire_passed,
  //       item.convention_received
  //     );
  //   })
  //   .filter((item) => item !== null);
  // function createData(
  //   id,
  //   hasNewMessage,
  //   first_name,
  //   last_name,
  //   email,
  //   phone,
  //   mission,
  //   mission_location,
  //   skill,
  //   created_at,
  //   status,
  //   is_active,
  //   first_contact,
  //   nb_interviews,
  //   trueValuesCount,
  //   test_voltaire_passed,
  //   convention_received
  // ) {
  //   return {
  //     id,
  //     hasNewMessage,
  //     first_name,
  //     last_name,
  //     email,
  //     phone,
  //     mission,
  //     mission_location,
  //     skill,
  //     created_at,
  //     status,
  //     is_active,
  //     first_contact,
  //     nb_interviews,
  //     trueValuesCount,
  //     test_voltaire_passed,
  //     convention_received,
  //   };
  // }
  // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  // --------------------------------------------------------------------------------------------------

  // // Effect to check for new messages and update flags
  // useEffect(() => {
  //   const updatedFlags = {};
  //   filteredData.forEach((item) => {
  //     const prevCount = prevMessageCountsRef.current[item.id] || 0;
  //     const currentCount = Array.isArray(item.internal_thread)
  //       ? item.internal_thread.length
  //       : 0;

  //     if (currentCount > prevCount) {
  //       updatedFlags[item.id] = true;
  //       prevMessageCountsRef.current[item.id] = currentCount;
  //     }
  //   });

  //   setNewMessageFlags((prev) => ({ ...prev, ...updatedFlags }));
  // }, [filteredData]);

  useEffect(() => {
    function createData(
      id,
      first_name,
      last_name,
      email,
      phone,
      mission,
      mission_location,
      skill,
      created_at,
      status,
      is_active,
      first_contact,
      nb_interviews,
      trueValuesCount,
      test_voltaire_passed,
      convention_received,
      is_available
    ) {
      // Check if any required fields are undefined
      if (id === undefined) {
        console.error('createData: id is undefined');
        return null;
      }
      return {
        id,
        first_name,
        last_name,
        email,
        phone,
        mission,
        mission_location,
        skill,
        created_at,
        status,
        is_active,
        first_contact,
        nb_interviews,
        trueValuesCount,
        test_voltaire_passed,
        convention_received,
        is_available,
      };
    }
    setLoading(true);
    console.log('filteredData:', filteredData);
    const newRows = filteredData
      .map((item, index) => {
        try {
          const nb_interviews = Array.isArray(item.interviews)
            ? item.interviews.filter((element) => JSON.parse(element).isActive)
                .length
            : 0;
          const first_contact = item.pre_interview
            ? JSON.parse(item.pre_interview).isActive
            : null;

          if (item.mission === null) {
            return null;
          }
          console.log('Item form filteredData:', item);

          const row = createData(
            item.id,
            item.first_name,
            item.last_name,
            item.email,
            item.phone,
            item.mission.title || null,
            item.mission.location || null,
            item.skill,
            item.created_at,
            item.status,
            item.is_active,
            first_contact,
            nb_interviews,
            item.trueValuesCount,
            item.test_voltaire_passed,
            item.convention_received,
            item.is_available
          );
          if (!row) {
            console.log(
              `createData returned null for item at index ${index}:`,
              item
            );
          }

          return row;
        } catch (error) {
          console.error(
            `Error processing item at index ${index}:`,
            error,
            item
          );
          return null;
        }
      })
      .filter((item) => item !== null);

    setRows(newRows);
    setLoading(false);
  }, [filteredData, newMessageFlags]);

  // --------------------------------------------------------------------------------------------------
  return (
    <>
      <Stack
        spacing={2}
        sx={{ width: 'auto', marginBottom: 2 }}
        direction="row">
        {/* <FormControl sx={{ minWidth: 200 }} size="small"> */}
        {/* <InputLabel id="subject-select-label">Select Subject</InputLabel> */}
        {/* <Select
            labelId="subject-select-label"
            id="subject-select"
            value={selectedSubject}
            onChange={handleSubjectChange}
            label="Select Subject">
            <MenuItem value="Mathématiques">Mathématiques</MenuItem>
            <MenuItem value="Physique-Chimie">Physique-Chimie</MenuItem>
            <MenuItem value="Science">Sciences</MenuItem>
            <MenuItem value="Histoire-Géographie">Histoire-Géographie</MenuItem>
            <MenuItem value="Français">Français</MenuItem>
            <MenuItem value="Anglais">Anglais</MenuItem>
            <MenuItem value="Sciences">Sciences</MenuItem>
            <MenuItem value="Codage">Codage</MenuItem>
            {/* Add more subjects as needed 
          </Select> */}
        <Autocomplete
          value={selectedSubject}
          onChange={(event, newValue) => {
            setSelectedSubject(newValue);
          }}
          inputValue={inputSubjectValue}
          onInputChange={(event, newInputValue) => {
            setInputSubjectValue(newInputValue);
          }}
          id="controllable-states-demo"
          options={subjects}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          getOptionLabel={(option) => (option ? option.label : '')}
          sx={{ width: 300 }}
          renderInput={(params) => (
            <TextField {...params} label="Saisir une matière" size="small" />
          )}
        />
        <Autocomplete
          value={selectedLevel}
          onChange={(event, newValue) => {
            setSelectedLevel(newValue);
          }}
          inputValue={inputLevelValue}
          onInputChange={(event, newInputValue) => {
            setInputLevelValue(newInputValue);
          }}
          id="controllable-states-demo"
          options={levels}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          getOptionLabel={(option) => (option ? option.label : '')}
          sx={{ width: 300 }}
          renderInput={(params) => (
            <TextField {...params} label="Saisir une classe" size="small" />
          )}
        />
        <Autocomplete
          value={selectedDay}
          onChange={(event, newValue) => {
            setSelectedDay(newValue);
          }}
          inputValue={inputDayValue}
          onInputChange={(event, newInputValue) => {
            setInputDayValue(newInputValue);
          }}
          id="controllable-states-demo"
          options={days}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          getOptionLabel={(option) => (option ? option.label : '')}
          sx={{ width: 300 }}
          renderInput={(params) => (
            <TextField {...params} label="Saisir un jour" size="small" />
          )}
        />
        <Autocomplete
          value={selectedTimeStart}
          onChange={(event, newValue) => {
            setSelectedTimeStart(newValue);
          }}
          inputValue={inputTimeStartValue}
          onInputChange={(event, newInputValue) => {
            setInputTimeStartValue(newInputValue);
          }}
          id="controllable-states-demo"
          options={times}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          getOptionLabel={(option) => (option ? option.label : '')}
          sx={{ width: 200 }}
          renderInput={(params) => (
            <TextField {...params} label="Saisir heure début" size="small" />
          )}
        />
        <Autocomplete
          value={selectedTimeEnd}
          onChange={(event, newValue) => {
            setSelectedTimeEnd(newValue);
          }}
          inputValue={inputTimeEndValue}
          onInputChange={(event, newInputValue) => {
            setInputTimeEndValue(newInputValue);
          }}
          id="controllable-states-demo"
          options={times}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          getOptionLabel={(option) => (option ? option.label : '')}
          sx={{ width: 200 }}
          renderInput={(params) => (
            <TextField {...params} label="Saisir heure fin" size="small" />
          )}
        />
        {/* </FormControl> */}

        <Button variant="contained" onClick={handleSearch} color="primary">
          Filtrer
        </Button>
      </Stack>
      <Box sx={{ height: 'auto', width: '100%' }}>
        <FullEditDataGrid
          onRowClick={handleRowClick}
          {...rows}
          // slots={{
          //   toolbar: CustomToolbar,
          // }}
          loading={loading}
          rows={rows}
          columns={columns}
          noActionColumn
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 30,
              },
            },
          }}
          pageSizeOptions={[30]}
          disableRowSelectionOnClick
        />
      </Box>
    </>
  );
}
