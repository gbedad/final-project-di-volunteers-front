import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import FullEditDataGrid from 'mui-datagrid-full-edit';
import { useEffect, useState } from 'react';
import useStudentData from './details';
import moment from 'moment';
import { parseISO, format } from 'date-fns';
import { Typography, Box, CircularProgress } from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

import { PhoneInputCell } from '../../../core/utils/phoneFormatter';
import { formatPhoneNumber } from '../../../core/utils/phoneFormatter';

import { useAuth } from '../../../../AuthContext';

const EmailCell = (props) => {
  const { value } = props;
  return (
    <a href={`mailto:${value}`} onClick={(e) => e.stopPropagation()}>
      {value}
    </a>
  );
};

const capitalizeFamilyName = (fullname) => {
  if (fullname == null) return '';
  const nameParts = fullname.split(/[\s-]+/);
  if (nameParts.length < 2) {
    return fullname.charAt(0).toUpperCase() + fullname.slice(1).toLowerCase();
  }

  // Capitalize composed names
  const capitalizedNames = nameParts.map(
    (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
  );

  // Reconstruct the name
  const separator = fullname.includes('-') ? '-' : ' ';
  const capitalizedFullname = capitalizedNames.join(separator);

  return capitalizedFullname;
};

export default function ManageGrid() {
  const { rows, setRows, getAll, saveRow, deleteRow } = useStudentData();
  const [localRows, setLocalRows] = useState(rows);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    getAll().finally(() => {
      setLoading(false);
    });
  }, [getAll]);

  const onSaveRow = (id, updatedRow, oldRow, oldRows) => {
    console.log(updatedRow);

    saveRow(updatedRow)
      .then((res) => {
        const dbRow = res.data; // This is an object

        setLocalRows((currentRows) => {
          const updatedRows = currentRows.map((row) =>
            row.id === dbRow.id ? dbRow : row
          );

          if (updatedRow.isNew) {
            return [...updatedRows, dbRow];
          }

          return updatedRows;
        });
      })
      .catch((err) => {
        console.error(err);
        setLocalRows(oldRows); // Restore old rows in case of error
      });
  };

  const onDeleteRow = (id, oldRow, oldRows) => {
    deleteRow(id)
      .then(() => {
        setRows(
          oldRows
            .filter((r) => r.id !== id)
            .map((r, i) => ({ ...r, no: i + 1 }))
        );
      })
      .catch((err) => {
        setRows(oldRows);
      });
  };

  const handleDoubleRowClick = (params) => {
    console.log('Double click detected');
    console.log('Params:', params);
    const studentId = params.row.id;
    console.log('studentId:', studentId);

    console.log('address:', params.row);

    navigate(`/admin/student-demand/${studentId}`, {
      state: { userLogged: user, studentSelected: studentId },
    });
  };

  const createRowData = (rows) => {
    const newId = Math.max(...rows.map((r) => (r.id ? r.id : 0) * 1)) + 1;
    const newNo = Math.max(...rows.map((r) => (r.no ? r.no : 0) * 1)) + 1;
    return { id: newId, no: newNo };
  };

  return (
    <>
      <Box m={2}>
        <Box sx={{ verticalAlign: 'middle' }}>
          <Typography fontSize="3rem" style={{ cursor: 'pointer' }}>
            <ExitToAppIcon
              onClick={() =>
                navigate('/admin', { state: { userLogged: user } })
              }
              color="primary"
            />
          </Typography>
        </Box>
        <Typography variant="h4" mb={2} textAlign={'center'}>
          Gestion des bénéficiaires
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : (
          <FullEditDataGrid
            onRowClick={handleDoubleRowClick}
            columns={columns}
            rows={rows.map((r, i) => ({ ...r, no: i + 1 }))}
            onSaveRow={onSaveRow}
            onDeleteRow={onDeleteRow}
            createRowData={createRowData}
            loading={loading}
            initialState={{
              columns: {
                columnVisibilityModel: {
                  // Hide columns status and traderName, the other columns will remain visible
                  no: false,
                  id: true,
                  created_at: false,
                },
              },
            }}
          />
        )}
      </Box>
    </>
  );
}

const columns = [
  {
    field: 'no',
    headerName: 'No',
    width: 50,
    hideable: true,
    align: 'center',
    type: 'number',
    editable: false,
  },
  {
    field: 'id',
    headerName: 'Id',
    width: 50,
    hideable: false,
    align: 'center',
    type: 'number',
    editable: false,
  },
  {
    field: 'hasMessage',
    headerName: 'Fil',
    width: 80,
    headerAlign: 'left',
    type: 'string',
    align: 'left',
    editable: false,
  },
  {
    field: 'first_name',
    headerName: 'Prénom',
    width: 150,
    headerAlign: 'left',
    type: 'string',
    align: 'left',
    editable: true,
    valueFormatter: (params) => {
      if (params.value === null) return '';
      return capitalizeFamilyName(params.value);
    },
  },
  {
    field: 'last_name',
    headerName: 'Nom',
    width: 150,
    headerAlign: 'left',
    type: 'string',
    editable: true,
    valueFormatter: (params) => capitalizeFamilyName(params.value),
  },
  {
    field: 'phone',
    headerName: 'Téléphone',
    width: 150,
    headerAlign: 'left',
    type: 'string',
    editable: true,
    valueFormatter: (params) => formatPhoneNumber(params.value),
    renderEditCell: (params) => <PhoneInputCell {...params} />,
  },
  {
    field: 'email',
    headerName: 'Email',
    width: 200,
    headerAlign: 'left',
    type: 'email',
    editable: true,

    renderCell: (params) => (
      <EmailCell value={params.value} style={{ color: 'primary' }} />
    ),
  },

  {
    field: 'level',
    headerName: 'Classe',
    width: 120,
    headerAlign: 'left',
    type: 'string',
    editable: true,
  },
  {
    field: 'address',
    headerName: 'Ville',
    width: 150,
    headerAlign: 'left',
    type: 'string',
    editable: true,
    valueGetter: (params) => {
      const address = params.row.address;

      // Check if address is undefined, null, or an empty string
      if (!address) {
        return '';
      }

      // Regex to match zipcode and city
      const match = address.match(/(\d{5})\s+([^\d]+)$/);

      if (match) {
        const [, zipcode, city] = match;
        return `${zipcode} ${city.trim()}`;
      } else {
        return 'N/A';
      }
    },
  },
  {
    field: 'topic',
    headerName: 'Matière',
    width: 150,
    headerAlign: 'left',
    type: 'string',
    editable: true,
    valueGetter: (params) => {
      const topics = params.row.topics;
      let parsedTopics = [];

      if (typeof topics === 'string') {
        try {
          parsedTopics = JSON.parse(topics);
        } catch (error) {
          console.error(
            `Error parsing topics for row ${params.row.id}:`,
            error
          );
        }
      } else if (Array.isArray(topics)) {
        parsedTopics = topics;
      } else if (topics && typeof topics === 'object') {
        parsedTopics = [topics]; // If it's a single object, wrap it in an array
      }

      if (!Array.isArray(parsedTopics)) {
        console.warn(
          `Unexpected topics data type for row ${params.row.id}:`,
          typeof topics
        );
        return '';
      }

      // Filter subjects with priority 1
      const filteredSubjects = parsedTopics
        .filter(
          (item) => item && typeof item === 'object' && item.priority === 1
        )
        .map((item) => item.subject)
        .filter((subject) => subject); // Remove any undefined or null subjects

      // Return the filtered subjects as a comma-separated string
      return filteredSubjects.join(', ');
    },
  },
  {
    field: 'interviewPriority',
    headerName: 'Priorité',
    width: 80,
    headerAlign: 'left',
    type: 'string',
    editable: true,
    valueGetter: (params) => {
      const interviews = params.row.interviews;
      let parsedInterviews = [];

      if (typeof interviews === 'string') {
        try {
          parsedInterviews = JSON.parse(interviews);
        } catch (error) {
          console.error(
            `Error parsing interviews for row ${params.row.id}:`,
            error
          );
        }
      } else if (Array.isArray(interviews)) {
        parsedInterviews = interviews;
      }

      if (Array.isArray(parsedInterviews) && parsedInterviews.length > 0) {
        const lastInterview = parsedInterviews[parsedInterviews.length - 1];
        return lastInterview?.priority || 'No priority';
      }

      return '';
    },
  },
  {
    field: 'preInterviewDate',
    headerName: 'Call',
    width: 100,
    headerAlign: 'left',
    align: 'left',
    type: 'date',
    editable: true,
    valueGetter: (params) => {
      const preinterview = params.row.pre_interview;

      if (!preinterview) {
        return null;
      }

      if (typeof preinterview === 'string') {
        try {
          const parsedInterview = JSON.parse(preinterview);
          return parsedInterview?.date ? new Date(parsedInterview.date) : null;
        } catch (error) {
          console.error(
            `Error parsing pre_interview for row ${params.row.id}:`,
            error
          );
          return null;
        }
      } else if (typeof preinterview === 'object') {
        return preinterview?.date ? new Date(preinterview.date) : null;
      }

      return null;
    },
    valueFormatter: (params) => {
      if (params.value instanceof Date) {
        return params.value.toLocaleDateString();
      }
      return '';
    },
  },

  {
    field: 'interviewDate',
    headerName: "Date d'entretien",
    width: 150,
    headerAlign: 'left',
    type: 'date',
    editable: true,
    align: 'left',
    valueGetter: (params) => {
      const interviews = params.row.interviews;
      if (typeof interviews === 'string') {
        try {
          const parsedInterviews = JSON.parse(interviews);
          if (Array.isArray(parsedInterviews) && parsedInterviews.length > 0) {
            const lastInterview = parsedInterviews[parsedInterviews.length - 1];
            return lastInterview.date ? new Date(lastInterview.date) : null;
          }
        } catch (error) {
          console.error('Error parsing interviews:', error);
        }
      } else if (Array.isArray(interviews) && interviews.length > 0) {
        const lastInterview = interviews[interviews.length - 1];
        return lastInterview.date ? new Date(lastInterview.date) : null;
      }
      return null;
    },
    valueFormatter: (params) => {
      if (params.value) {
        return params.value.toLocaleDateString();
      }
      return '';
    },
  },

  {
    // Column definition
    field: 'launched_on',
    headerName: 'Lancé le',
    width: 150,
    headerAlign: 'left',
    type: 'date',
    editable: true,

    // Value Getter: just return the value as-is (no Date object creation)
    valueGetter: (params) => {
      return params.value ? params.value : null;
    },

    // Value Setter: store the date in 'yyyy-MM-dd' format as a string
    valueSetter: (params) => {
      if (!params.value) return null;

      const selectedDate = new Date(params.value);

      // Format the date as yyyy-MM-dd string without creating a Date object
      const formattedDate = `${selectedDate.getFullYear()}-${(
        selectedDate.getMonth() + 1
      )
        .toString()
        .padStart(2, '0')}-${selectedDate
        .getDate()
        .toString()
        .padStart(2, '0')}`;

      return { ...params.row, launched_on: formattedDate };
    },

    // Value Formatter: display the date in dd/MM/yyyy format (convert the string)
    valueFormatter: (params) => {
      if (!params.value) return '';

      // Parse the ISO date string and format it for display
      const formattedDate = format(parseISO(params.value), 'dd/MM/yyyy');

      return formattedDate;
    },
  },
  {
    field: 'created_at',
    headerName: 'Date creation',
    width: 150,
    headerAlign: 'left',
    type: 'string',
    editable: false,
    hide: true,
    align: 'center',
    renderCell: ({ value }) => moment(value).format('DD/MM//yyyy'),
  },
];
