import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Box, Stack, Button, Autocomplete, TextField } from '@mui/material';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  GRID_CHECKBOX_SELECTION_COL_DEF,
} from '@mui/x-data-grid';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

import TypeSpecimenRoundedIcon from '@mui/icons-material/TypeSpecimenRounded';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

import Rating from '@mui/material/Rating';
import FilePresentOutlinedIcon from '@mui/icons-material/FilePresentOutlined';
import FilePresentRoundedIcon from '@mui/icons-material/FilePresentRounded';
import { existingSubjects } from '../options/existingOptions';

import { formatPhoneNumber } from '../js/phoneNumbersSpace';

const StyledRating = styled(Rating)({
  '& .MuiRating-iconFilled': {
    color: '#ff6d75',
  },
  '& .MuiRating-iconHover': {
    color: '#ff3d47',
  },
});
const subjects = existingSubjects;

const columns = [
  {
    ...GRID_CHECKBOX_SELECTION_COL_DEF,
    hideable: true,
  },
  { field: 'id', headerName: 'ID', width: 90, hideable: true },
  // {
  //   field: 'first_name',
  //   headerName: 'First name',
  //   width: 150,
  //   editable: true,
  // },
  // {
  //   field: 'last_name',
  //   headerName: 'Last name',
  //   width: 150,
  //   editable: true,
  // },
  {
    field: 'fullName',
    headerName: 'Nom',
    description: 'This column has a value getter and is not sortable.',
    sortable: false,
    width: 220,
    valueGetter: (params) =>
      `${params.row.first_name || ''} ${params.row.last_name || ''}`,
  },
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
      params.row.phone ? `${formatPhoneNumber(params.row.phone)}` : '',

    width: 150,
    editable: true,
  },
  {
    field: 'mission',
    headerName: 'Mission',

    width: 150,
    editable: true,
  },
  {
    field: 'mission_location',
    headerName: 'Lieu',

    width: 150,
    editable: true,
  },
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
    field: 'trueValuesCount',
    headerName: 'Documents',

    width: 130,
    editable: true,
    renderCell: renderRating,
  },
  {
    field: 'test_voltaire_passed',
    headerName: 'Test Fr.',

    width: 70,
    editable: true,
    renderCell: (params) => {
      return params.value ? (
        <TypeSpecimenRoundedIcon
          style={{
            color: 'yellowgreen',
          }}
        />
      ) : (
        ''
      );
    },
  },
  {
    field: 'convention_received',
    headerName: 'Conv.',

    width: 50,
    editable: true,
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
function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}

function renderRating(params) {
  return (
    <StyledRating
      readOnly
      value={params.value}
      getLabelText={(value) => `${value} ArticleIcon${value !== 1 ? 's' : ''}`}
      icon={<FilePresentRoundedIcon fontSize="10" />}
      emptyIcon={<FilePresentOutlinedIcon />}
      max={3}
    />
  );
}
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
  trueValuesCount,
  test_voltaire_passed,
  convention_received,
  interviews
) {
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
    trueValuesCount,
    test_voltaire_passed,
    convention_received,
    interviews,
  };
}

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
  const [filteredData, setFilteredData] = useState([]);

  // const [value, setValue] = React.useState(subjects[0]);
  const [inputValue, setInputValue] = React.useState('');

  // const [page, setPage] = React.useState(0);
  // const [rowsPerPage, setRowsPerPage] = React.useState(10);

  // const handleSubjectChange = (event) => {
  //   setSelectedSubject(event.target.value);
  // };
  // console.log(selectedSubject);

  function filterBySubject(users, subject) {
    return users.filter((user) => {
      const topics = user.skill?.topics || []; // Access the topics array and handle the case when it is undefined or null

      return topics.some((topic) =>
        JSON.parse(topic).subject.includes(subject)
      );
    });
  }
  const handleSearch = () => {
    const filteredResults = filterBySubject(cleanedArray, selectedSubject);
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
  const handleRowClick = (params) => {
    setSelectedUser(params.row.id);
    navigate('/change-status', {
      state: { userId: params.row.id, userLogged: location.state.userLogged },
    });
  };

  const calculateTrueValues = (users) => {
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

  const rows = filteredData.map((item, key = item.id) => {
    if (item.mission === null) {
      return [];
    }
    return createData(
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
      item.trueValuesCount,
      item.test_voltaire_passed,
      item.convention_received
    );
  });
  return (
    <>
      <Stack spacing={2} sx={{ width: 600, marginBottom: 2 }} direction="row">
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
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
          }}
          id="controllable-states-demo"
          options={subjects}
          sx={{ width: 300 }}
          renderInput={(params) => (
            <TextField {...params} label="Saisir un sujet" size="small" />
          )}
        />
        {/* </FormControl> */}

        <Button variant="contained" onClick={handleSearch} color="primary">
          Search
        </Button>
      </Stack>
      <Box sx={{ height: 670, width: '100%' }}>
        <DataGrid
          onRowClick={handleRowClick}
          {...rows}
          slots={{
            toolbar: CustomToolbar,
          }}
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          pageSizeOptions={[10]}
          disableRowSelectionOnClick
        />
      </Box>
    </>
  );
}
