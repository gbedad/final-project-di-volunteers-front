import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Badge,
  Box,
  Chip,
  Divider,
  Link,
  Paper,
  Typography,
  Stack,
  Button,
  Autocomplete,
  TextField,
  Tooltip,
} from '@mui/material';

import { GRID_CHECKBOX_SELECTION_COL_DEF } from '@mui/x-data-grid';
import FullEditDataGrid from 'mui-datagrid-full-edit';

import TypeSpecimenRoundedIcon from '@mui/icons-material/TypeSpecimenRounded';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

import FolderIcon from '@mui/icons-material/Folder';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
// import DoneIcon from '@mui/icons-material/Done';
// import MoodIcon from '@mui/icons-material/Mood';
import MessageIcon from '@mui/icons-material/Message';
// import PersonPinIcon from '@mui/icons-material/PersonPin';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import CallIcon from '@mui/icons-material/Call';
import LooksOneIcon from '@mui/icons-material/LooksOne';
import LooksTwoIcon from '@mui/icons-material/LooksTwo';
import Looks3Icon from '@mui/icons-material/Looks3';
import {
  existingDays,
  existingSubjects,
} from '../options/existingOptions';

import { parsePhoneNumber } from 'awesome-phonenumber';
import WhatsAppButton from './WhatsAppButton';
import CoPresentIcon from '@mui/icons-material/CoPresent';
import EmailButton from './EmailButton';
import BulkActions from './admin/BulkActions';
import { useSessionState } from '../js/useSessionState';
import {
  ACTIVE_TUTORS,
  LEVELS,
  SEARCH_TIMES,
  matchesSearch,
} from '../js/volunteerSearch';
import DashboardToolbar from './admin/DashboardToolbar';
import { frFR } from '@mui/x-data-grid';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { isManager } from '../js/roles';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const subjects = existingSubjects;
const dayLabels = existingDays.map((d) => d.label);

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

// Grid texts in French; the quick search is about names and e-mails, not
// the tutor search above
const GRID_LOCALE = {
  ...frFR.components.MuiDataGrid.defaultProps.localeText,
  toolbarQuickFilterPlaceholder: 'Rechercher un nom, un e-mail…',
};

// Former volunteers, hidden unless their chip is chosen
const ARCHIVED = 'Archivé';

// Status chips above the search; the rare ones only when someone has them
const STATUS_CHIPS = [
  { status: 'Compte créé', label: 'Compte créé' },
  { status: 'A renseigner', label: 'A renseigner', always: true },
  { status: 'Renseigné', label: 'Renseigné' },
  { status: 'A télécharger', label: 'A télécharger', always: true },
  { status: 'A interviewer', label: 'A interviewer', always: true },
  { status: 'A finaliser', label: 'A finaliser', always: true },
  { status: 'Validé', label: 'Validés', always: true },
  { status: 'A conserver', label: 'A conserver' },
  { status: 'Déclinée', label: 'Déclinées', always: true },
];

// Help shown over the "?" of the search panel
const SearchHelp = () => (
  <Box sx={{ p: 0.5, fontSize: '0.85rem' }}>
    <p style={{ margin: '0 0 6px' }}>Les critères se combinent.</p>
    <p style={{ margin: '0 0 6px' }}>
      Exemple : <i>Mathématiques, de 4ème à 3ème, mercredi de 14:00 à 16:00</i>{' '}
      trouve les tuteurs qui enseignent les maths sur <b>tous</b> ces niveaux{' '}
      <b>et</b> qui sont libres le mercredi sur <b>toute</b> cette plage.
    </p>
    <p style={{ margin: 0 }}>
      Un seul niveau ou une seule heure suffit. Plusieurs jours : l'un ou
      l'autre.
    </p>
  </Box>
);

const levelsText = (from, to) =>
  from && to ? (from === to ? `en ${from}` : `de ${from} à ${to}`) : from || to ? `en ${from || to}` : '';
const timesText = (from, to) =>
  from && to
    ? `de ${from} à ${to}`
    : from
    ? `à partir de ${from}`
    : to
    ? `jusqu'à ${to}`
    : '';

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
  // Filters and grid state are kept for the browser tab, so they are still
  // there when coming back from a volunteer's page
  const [subject, setSubject] = useSessionState('dashboard.q.subject', null);
  const [levelFrom, setLevelFrom] = useSessionState(
    'dashboard.q.levelFrom',
    null
  );
  const [levelTo, setLevelTo] = useSessionState('dashboard.q.levelTo', null);
  const [days, setDays] = useSessionState('dashboard.q.days', []);
  const [timeFrom, setTimeFrom] = useSessionState('dashboard.q.timeFrom', null);
  const [timeTo, setTimeTo] = useSessionState('dashboard.q.timeTo', null);
  const [selectedCohort, setSelectedCohort] = useSessionState(
    'dashboard.cohort',
    null
  );
  // Status chip clicked above the search: a status, or ACTIVE_TUTORS
  const [statusFilter, setStatusFilter] = useSessionState(
    'dashboard.status',
    null
  );
  const [sortModel, setSortModel] = useSessionState('dashboard.sort', []);
  // Column filters and the quick search of the toolbar
  const [gridFilterModel, setGridFilterModel] = useSessionState(
    'dashboard.gridFilter',
    { items: [] }
  );
  const [paginationModel, setPaginationModel] = useSessionState(
    'dashboard.page',
    { page: 0, pageSize: 30 }
  );
  // Call, Entretiens, Test and Fil are hidden until shown with "Columns"
  const [columnVisibilityModel, setColumnVisibilityModel] = useSessionState(
    'dashboard.columns',
    {
      hasNewMessage: false,
      first_contact: false,
      nb_interviews: false,
      test_voltaire_passed: false,
    }
  );


  const [rows, setRows] = useState([]);
  // Ids of the rows left after every filter (search fields, column filters,
  // quick search), for the result sentence
  const [visibleKey, setVisibleKey] = useState(null);
  // Unread messages of the internal discussion, per volunteer
  const [unread, setUnread] = useState({});
  const [selectionModel, setSelectionModel] = useState([])

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
        const count = unread[params.row.id];
        return count ? (
          <Tooltip
            title={`${count} message${count > 1 ? 's' : ''} non lu${
              count > 1 ? 's' : ''
            }`}>
            <Badge badgeContent={count} color="error">
              <MessageIcon color="primary" />
            </Badge>
          </Tooltip>
        ) : null;
      },
    },
    {
      field: 'first_name',
      headerName: 'Prénom',
      width: 150,
    },
    {
      field: 'last_name',
      headerName: 'Nom',
      width: 150,
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
      width: 290,
      renderCell: (params) => (
        <>
          <Link
            href={`mailto:${params.value}`}
            onClick={(event) => event.stopPropagation()}
            sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {params.value}
          </Link>
          <EmailButton volunteer={params.row} size="small" />
        </>
      ),
    },
    {
      field: 'phone',
      headerName: 'Téléphone',
      valueGetter: (params) =>
        params.row.phone
          ? `${parsePhoneNumber(params.row.phone).number.international}`
          : '',
      renderCell: (params) => (
        <>
          <span>{params.value}</span>
          <WhatsAppButton volunteer={params.row} size="small" />
        </>
      ),
      width: 190,
    },
    // {
    //   field: 'mission',
    //   headerName: 'Mission',
    //   valueFormatter: (params) => {
    //     if (params.value) {
    //       return params.value.replace(/^TUTORAT\s*/i, '').trim();
    //     }
    //     return '';
    //   },
    //   width: 150,
    //   editable: true,
    // },

    // {
    //   field: 'mission_location',
    //   headerName: 'Lieu',

    //   width: 150,
    //   editable: true,
    // },
    {
      field: 'site',
      headerName: 'Mode',
      width: 120,
      editable: false,
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
    },
    {
      field: 'is_available',
      headerName: 'Disponible',

      width: 100,
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
      field: 'docs',
      headerName: 'Documents',
      width: 100,
      // Sort: complete, then ready for the interview, then incomplete
      valueGetter: ({ value }) => value?.level ?? 0,
      renderCell: renderDocuments,
    },
    {
      field: 'test_voltaire_passed',
      headerName: 'Test',

      width: 70,
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
      field: 'cohorte_year',
      headerName: 'Cohorte',
      width: 110,
      // Sort/filter/export on the latest year; all years in the tooltip
      valueGetter: ({ value }) =>
        value && value.length ? [...value].sort()[value.length - 1] : '',
      renderCell: ({ row, value }) =>
        value ? (
          <span title={[...row.cohorte_year].sort().join(', ')}>
            {value}
            {row.cohorte_year.length > 1 ? ` (+${row.cohorte_year.length - 1})` : ''}
          </span>
        ) : (
          ''
        ),
    },
    {
      field: 'is_active',
      headerName: 'Actif',
      width: 100,
      align: 'center',
      // A tutor teaching (or ready to teach) a student
      renderCell: (params) =>
        params.value ? (
          <Tooltip title="Tuteur actif : accompagne ou peut accompagner un élève">
            <Chip
              size="small"
              color="success"
              icon={<CoPresentIcon />}
              label="Actif"
            />
          </Tooltip>
        ) : null,
    },
  ];
  // function CustomToolbar() {
  //   return (
  //     <GridToolbarContainer>
  //       <GridToolbarExport />
  //     </GridToolbarContainer>
  //   );
  // }

  // CV + ID + B3: complete; CV + ID: ready for the interview; else incomplete
  function renderDocuments(params) {
    const { level, missing } = params.row.docs || { level: 0, missing: [] };
    const title =
      level === 2
        ? 'Documents complets'
        : level === 1
        ? "Prêt pour l'entretien, B3 manquant"
        : `Manque : ${missing.join(', ')}`;
    return (
      <Tooltip title={title}>
        {level === 0 ? (
          <FolderOutlinedIcon sx={{ color: 'text.disabled' }} />
        ) : (
          <FolderIcon color={level === 2 ? 'success' : 'warning'} />
        )}
      </Tooltip>
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

  function filterUsers(users, criteria) {
    return users.filter(
      (user) =>
        matchesSearch(user.skill, criteria) &&
        // Cohort: member during that academic year
        (!criteria.cohort || (user.cohorte_year || []).includes(criteria.cohort))
    );
  }

  // console.log("location====>>>", location);
  // Generate Order Data
  // Unread counts (admins only), refreshed when coming back to the tab
  useEffect(() => {
    let role;
    try {
      role = JSON.parse(localStorage.getItem('user'))?.user?.role;
    } catch {}
    if (!isManager(role)) return;
    const loadUnread = () =>
      axios
        .get(`${BASE_URL}/admin/thread/unread`)
        .then(({ data }) => setUnread(data))
        .catch((err) => console.error(err));
    loadUnread();
    window.addEventListener('focus', loadUnread);
    return () => window.removeEventListener('focus', loadUnread);
  }, []);

  const handleRowClick = useCallback(
    (params) => {
      setSelectedUser(params.row.id);
      navigate('/change-status', {
        state: { userId: params.row.id, userLogged: location.state.userLogged },
      });
    },
    [navigate, location.state]
  );


  // Received = uploaded or ticked "reçu sur papier" (flags kept by the server)
  const calculateTrueValues = (users) => {
    return users.map((user) => {
      const missing = [
        !user.cv_received && 'CV',
        !user.id_received && "pièce d'identité",
        !user.b3_received && 'B3',
      ].filter(Boolean);
      const readyForInterview = user.cv_received && user.id_received;
      const level = !readyForInterview ? 0 : user.b3_received ? 2 : 1;
      return { ...user, docs: { level, missing } };
    });
  };
  const usersWithTrueValuesCount = calculateTrueValues(users);

  console.log(usersWithTrueValuesCount);

  const updateTopicsToEmptyArray = (data) => {
    return data.map((item) => {
      if (item.skill === null) {
        return { ...item, skill: [] };
      }
      return item;
    });
  };
  function checkLocation(values) {
    const onsiteLocations = [
      'Aubervilliers',
      'Paris 12ème',
      '22 rue Gabriel Lamé, Paris 12ème',
      '181 avenue Daumesnil, Paris 12ème',
      'Paris 18ème',
    ];

    // Check if the array contains only "dist"
    if (values.length === 1 && values[0] === 'A distance') {
      return 'Distanciel';
    } else if (
      values.length === 1 &&
      values[0] === 'Présentiel ou distanciel'
    ) {
      return 'Bi-modal';
    }

    // Check if all values in the array are in the onsiteLocations array
    const isOnsite = values.every((value) => onsiteLocations.includes(value));

    return isOnsite ? 'Présentiel' : null;
  }

  let cleanedArray = updateTopicsToEmptyArray(usersWithTrueValuesCount);

  // Cohort filter options: every academic year present, newest first
  const cohortOptions = [
    ...new Set(cleanedArray.flatMap((u) => u.cohorte_year || [])),
  ]
    .sort()
    .reverse();

  // Filters apply as soon as they are chosen
  const searched = useMemo(
    () =>
      filterUsers(cleanedArray, {
        subject,
        levelFrom,
        levelTo,
        days,
        timeFrom,
        timeTo,
        cohort: selectedCohort,
      }),
    // cleanedArray is rebuilt from users on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      users,
      subject,
      levelFrom,
      levelTo,
      days,
      timeFrom,
      timeTo,
      selectedCohort,
    ]
  );
  // Counts per status of the volunteers found by the search
  // Former volunteers (archived) only appear with their own chip
  const current = useMemo(
    () => searched.filter((u) => u.status !== ARCHIVED),
    [searched]
  );
  const statusCounts = useMemo(() => {
    const counts = {
      [ACTIVE_TUTORS]: 0,
      [ARCHIVED]: searched.length - current.length,
    };
    for (const u of current) {
      counts[u.status] = (counts[u.status] || 0) + 1;
      if (u.is_active) counts[ACTIVE_TUTORS] += 1;
    }
    return counts;
  }, [searched, current]);
  const filteredData = useMemo(
    () =>
      statusFilter === ARCHIVED
        ? searched.filter((u) => u.status === ARCHIVED)
        : !statusFilter
        ? current
        : current.filter((u) =>
            statusFilter === ACTIVE_TUTORS
              ? u.is_active === true
              : u.status === statusFilter
          ),
    [searched, current, statusFilter]
  );
  const hasFilters =
    [
      subject,
      levelFrom,
      levelTo,
      timeFrom,
      timeTo,
      selectedCohort,
      statusFilter,
    ].some(Boolean) ||
    days.length > 0 ||
    gridFilterModel.items.length > 0 ||
    (gridFilterModel.quickFilterValues || []).length > 0;

  // Plain-language summary of what the table shows
  const shownCount =
    visibleKey === null
      ? rows.length
      : visibleKey
      ? visibleKey.split(',').length
      : 0;
  const plural = shownCount > 1;
  const teach = [subject, levelsText(levelFrom, levelTo)]
    .filter(Boolean)
    .join(', ');
  const when = [
    days.map((d) => d.toLowerCase()).join(' ou '),
    timesText(timeFrom, timeTo),
  ]
    .filter(Boolean)
    .join(', ');
  const gridFiltered =
    gridFilterModel.items.length > 0 ||
    (gridFilterModel.quickFilterValues || []).length > 0;
  const details = [
    teach && `${plural ? 'enseignent' : 'enseigne'} ${teach}`,
    when && `${plural ? 'disponibles' : 'disponible'} ${when}`,
    selectedCohort && `cohorte ${selectedCohort}`,
    statusFilter &&
      (statusFilter === ACTIVE_TUTORS
        ? 'tuteurs actifs'
        : `statut « ${statusFilter} »`),
    gridFiltered && 'avec les filtres du tableau',
  ].filter(Boolean);
  const resultSentence = !hasFilters ? (
    <>Tous les bénévoles ({shownCount})</>
  ) : (
    <>
      <b>
        {shownCount} bénévole{plural ? 's' : ''}
      </b>
      {details.length > 0 && ` · ${details.join(' · ')}`}
    </>
  );

  const resetFilters = () => {
    setSubject(null);
    setLevelFrom(null);
    setLevelTo(null);
    setDays([]);
    setTimeFrom(null);
    setTimeTo(null);
    setSelectedCohort(null);
    setStatusFilter(null);
    setGridFilterModel({ items: [] });
    setPaginationModel((model) => ({ ...model, page: 0 }));
  };
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
    const newRows = filteredData
      .map((item) => {
        const nb_interviews = Array.isArray(item.interviews)
          ? item.interviews.filter((element) => JSON.parse(element).isActive)
              .length
          : 0;
        const first_contact = item.pre_interview
          ? JSON.parse(item.pre_interview).isActive
          : null;
        const site =
          item.skill.where_location && checkLocation(item.skill.where_location);

        if (item.mission === null) {
          return null;
        }

        return createData(
          item.id,

          item.first_name,
          item.last_name,
          item.email,
          item.phone,
          item.mission.title || null,
          item.mission.location || null,
          site,
          item.skill,
          item.created_at,
          item.status,
          item.is_active,
          first_contact,
          nb_interviews,
          item.docs,
          item.test_voltaire_passed,
          item.convention_received,
          item.is_available,
          item.cohorte_year || []
        );
      })
      .filter((item) => item !== null);
    setRows(newRows);
  }, [filteredData]);

  function createData(
    id,

    first_name,
    last_name,
    email,
    phone,
    mission,
    mission_location,
    site,
    skill,
    created_at,
    status,
    is_active,
    first_contact,
    nb_interviews,
    docs,
    test_voltaire_passed,
    convention_received,
    is_available,
    cohorte_year
  ) {
    return {
      id,

      first_name,
      last_name,
      email,
      phone,
      mission,
      mission_location,
      site,
      skill,
      created_at,
      status,
      is_active,
      first_contact,
      nb_interviews,
      docs,
      test_voltaire_passed,
      convention_received,
      is_available,
      cohorte_year,
    };
  }
  

  // Ticked rows, for the bulk actions bar
  const selectedRows = selectionModel
    .map((id) => rows.find((row) => row.id === id))
    .filter(Boolean);

  // --------------------------------------------------------------------------------------------------
  return (
    <>
      {/* Status chips: counts of the volunteers found, click to filter */}
      <Stack
        direction="row"
        flexWrap="wrap"
        alignItems="center"
        gap={1}
        sx={{ mb: 2 }}>
        <Chip
          label={`Tous ${current.length}`}
          color="primary"
          variant={statusFilter ? 'outlined' : 'filled'}
          onClick={() => setStatusFilter(null)}
        />
        {STATUS_CHIPS.filter(
          (c) => c.always || statusCounts[c.status] > 0
        ).map((c) => (
          <Chip
            key={c.status}
            label={`${c.label} ${statusCounts[c.status] || 0}`}
            color="primary"
            variant={statusFilter === c.status ? 'filled' : 'outlined'}
            onClick={() =>
              setStatusFilter(statusFilter === c.status ? null : c.status)
            }
          />
        ))}
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        <Chip
          label={`Tuteurs actifs ${statusCounts[ACTIVE_TUTORS]}`}
          color="success"
          variant={statusFilter === ACTIVE_TUTORS ? 'filled' : 'outlined'}
          onClick={() =>
            setStatusFilter(
              statusFilter === ACTIVE_TUTORS ? null : ACTIVE_TUTORS
            )
          }
        />
        {statusCounts[ARCHIVED] > 0 && (
          <Chip
            label={`Archivés ${statusCounts[ARCHIVED]}`}
            variant={statusFilter === ARCHIVED ? 'filled' : 'outlined'}
            onClick={() =>
              setStatusFilter(statusFilter === ARCHIVED ? null : ARCHIVED)
            }
          />
        )}
      </Stack>

      {/* Search on what the volunteers can teach and when they are free */}
      <Paper variant="outlined" sx={{ p: 2, mb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
          <Typography variant="h6" sx={{ fontSize: '1.05rem' }}>
            Rechercher un tuteur
          </Typography>
          <Tooltip title={<SearchHelp />} arrow placement="right">
            <HelpOutlineIcon fontSize="small" color="action" />
          </Tooltip>
        </Stack>
        <Stack direction="row" flexWrap="wrap" gap={3} alignItems="flex-end">
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Que peut-il enseigner ?
            </Typography>
            <Stack direction="row" spacing={1}>
              {/* What: subject and level range, in the same topic */}
              <Autocomplete
                value={subject}
                onChange={(event, value) => setSubject(value)}
                options={subjects.map((o) => o.label)}
                sx={{ width: 210 }}
                renderInput={(params) => (
                  <TextField {...params} label="Matière" size="small" />
                )}
              />
              <Autocomplete
                value={levelFrom}
                onChange={(event, value) => {
                  setLevelFrom(value);
                  if (value && levelTo && LEVELS.indexOf(levelTo) < LEVELS.indexOf(value))
                    setLevelTo(value);
                }}
                options={LEVELS}
                sx={{ width: 130 }}
                renderInput={(params) => (
                  <TextField {...params} label="Niveau de" size="small" />
                )}
              />
              <Autocomplete
                value={levelTo}
                onChange={(event, value) => setLevelTo(value)}
                options={
                  levelFrom ? LEVELS.slice(LEVELS.indexOf(levelFrom)) : LEVELS
                }
                sx={{ width: 130 }}
                renderInput={(params) => (
                  <TextField {...params} label="Niveau à" size="small" />
                )}
              />
            </Stack>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Quand est-il disponible ?
            </Typography>
            <Stack direction="row" spacing={1}>
              {/* When: days and time window, in the same availability slot */}
              <Autocomplete
                multiple
                value={days}
                onChange={(event, value) => setDays(value)}
                options={dayLabels}
                // Short text instead of chips: the field keeps its height
                renderTags={(value) => (
                  <Typography noWrap sx={{ pl: 1, maxWidth: 120 }}>
                    {value.map((d) => d.slice(0, 3)).join(', ')}
                  </Typography>
                )}
                sx={{ width: 200 }}
                renderInput={(params) => (
                  <TextField {...params} label="Jours" size="small" />
                )}
              />
              <Autocomplete
                value={timeFrom}
                onChange={(event, value) => {
                  setTimeFrom(value);
                  if (value && timeTo && timeTo <= value) setTimeTo(null);
                }}
                options={SEARCH_TIMES}
                sx={{ width: 130 }}
                renderInput={(params) => (
                  <TextField {...params} label="Heure de" size="small" />
                )}
              />
              <Autocomplete
                value={timeTo}
                onChange={(event, value) => setTimeTo(value)}
                options={
                  timeFrom ? SEARCH_TIMES.filter((t) => t > timeFrom) : SEARCH_TIMES
                }
                sx={{ width: 130 }}
                renderInput={(params) => (
                  <TextField {...params} label="Heure à" size="small" />
                )}
              />
            </Stack>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Cohorte
            </Typography>
            <Autocomplete
              value={selectedCohort}
              onChange={(event, newValue) => setSelectedCohort(newValue)}
              options={cohortOptions}
              sx={{ width: 150 }}
              renderInput={(params) => (
                <TextField {...params} label="Année" size="small" />
              )}
            />
          </Box>
          <Button
            variant="outlined"
            onClick={resetFilters}
            disabled={!hasFilters}
            sx={{ ml: 'auto' }}>
            Réinitialiser
          </Button>
        </Stack>
      </Paper>
      {/* Always one line, so the page doesn't move when searching */}
      <Typography
        variant="body2"
        noWrap
        sx={{ mb: 2, ml: 0.5, minHeight: 20 }}>
        {resultSentence}
      </Typography>
      <BulkActions
        rows={selectedRows}
        onDone={() => {
          setSelectionModel([]);
          props.onChanged?.();
        }}
      />
      <Box sx={{ height: 'auto', width: '100%' }}>
        <FullEditDataGrid
          onRowDoubleClick={handleRowClick}
          {...rows}
          // slots={{
          //   toolbar: CustomToolbar,
          // }}
          editMode="row"

          rows={rows}
          columns={columns}
          slots={{ toolbar: DashboardToolbar }}
          localeText={GRID_LOCALE}
          noActionColumn
          onStateChange={(state) => {
            const lookup = state.filter?.filteredRowsLookup || {};
            const key = rows
              .filter((row) => lookup[row.id] !== false)
              .map((row) => row.id)
              .join(',');
            if (key !== visibleKey) setVisibleKey(key);
          }}
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          filterModel={gridFilterModel}
          onFilterModelChange={setGridFilterModel}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={setColumnVisibilityModel}
          pageSizeOptions={[30]}
          disableRowSelectionOnClick
          checkboxSelection
          onRowSelectionModelChange={(newRowSelectionModel) => {
            setSelectionModel(newRowSelectionModel);
          }}
          rowSelectionModel={selectionModel}
        />
      </Box>
    </>
  );
}
