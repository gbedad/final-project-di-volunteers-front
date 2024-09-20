import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import FullEditDataGrid from 'mui-datagrid-full-edit';
import { useEffect, useState } from 'react';
import useStudentData from '../components/StudentDashbord1/details';
import moment from 'moment';
import { Typography, Box } from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

import { PhoneInputCell } from '../../core/utils/phoneFormatter';
import { formatPhoneNumber } from '../../core/utils/phoneFormatter';

import { useAuth } from '../../../AuthContext';

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
  // const [rows, setRows] = useState([]);
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
    saveRow(updatedRow)
      .then((res) => {
        const dbRow = res.data;
        setRows(dbRow);
      })
      .catch((err) => {
        setRows(oldRows);
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
    const userId = params.row.id;
    // If there was a new message flag, remove it

    navigate(`/admin/student-demand/${userId}`, {
      state: { userLogged: user, userId },
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
          Gestion des bénéficiares
        </Typography>

        <FullEditDataGrid
          onRowDoubleClick={handleDoubleRowClick}
          columns={columns}
          rows={rows.map((r, i) => ({ ...r, no: i + 1 }))}
          onSaveRow={onSaveRow}
          onDeleteRow={onDeleteRow}
          createRowData={createRowData}
          loading={loading}
        />
      </Box>
    </>
  );
}

const columns = [
  {
    field: 'no',
    headerName: 'No',
    width: 50,
    hide: true,
    align: 'center',
    type: 'number',
    editable: false,
  },
  {
    field: 'id',
    headerName: 'Id',
    width: 50,
    hide: false,
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
    renderCell: (params) => <EmailCell value={params.value} />,
  },
  {
    field: 'classe',
    headerName: 'Classe',
    width: 150,
    headerAlign: 'left',
    type: 'string',
    editable: true,
  },
  {
    field: 'city',
    headerName: 'Ville',
    width: 150,
    headerAlign: 'left',
    type: 'string',
    editable: true,
  },
  {
    field: 'topic',
    headerName: 'Matière',
    width: 150,
    headerAlign: 'left',
    type: 'string',
    editable: true,
  },
  {
    field: 'priority',
    headerName: 'Priorité',
    width: 80,
    headerAlign: 'left',
    type: 'string',
    editable: true,
  },
  {
    field: 'pre_interview',
    headerName: 'Call',
    width: 80,
    headerAlign: 'left',
    type: 'date',
    editable: true,
  },

  {
    field: 'interview',
    headerName: 'Enttretien',
    width: 150,
    headerAlign: 'left',
    type: 'date',
    editable: true,
  },

  {
    field: 'launched',
    headerName: 'Lancé le',
    width: 150,
    headerAlign: 'left',
    type: 'string',
    editable: true,
  },
  {
    field: 'created_at',
    headerName: 'Date creation',
    width: 150,
    headerAlign: 'left',
    type: 'date',
    editable: false,
    align: 'center',
    renderCell: ({ value }) => moment(value).format('DD/MM//yyyy'),
  },
];
