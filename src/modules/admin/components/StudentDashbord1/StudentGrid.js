import * as React from 'react';
import FullEditDataGrid from 'mui-datagrid-full-edit';
import { useEffect, useState } from 'react';
import useStudentData from './details';
import moment from 'moment';
import { Typography } from '@mui/material';

const EmailCell = (props) => {
  const { value } = props;
  return (
    <a href={`mailto:${value}`} onClick={(e) => e.stopPropagation()}>
      {value}
    </a>
  );
};

export default function ManageGrid() {
  const { rows: rawRows, getAll, saveRow, deleteRow } = useStudentData();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setRows(rawRows.map((r, i) => ({ ...r, no: i + 1 })));
  }, [rawRows]);

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
        setRows(
          oldRows.map((r) =>
            r.id === updatedRow.id ? { ...dbRow, no: r.no } : r
          )
        );
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

  const createRowData = (rows) => {
    const newId = Math.max(...rows.map((r) => (r.id ? r.id : 0) * 1)) + 1;
    const newNo = Math.max(...rows.map((r) => (r.no ? r.no : 0) * 1)) + 1;
    return { id: newId, no: newNo };
  };

  return (
    <>
      <Typography variant="h4" mb={2} textAlign={'center'}>
        Gestion des bénéficiares
      </Typography>
      <FullEditDataGrid
        onRowDoubleClick={() => alert('Row clicked!')}
        columns={columns}
        rows={rows}
        onSaveRow={onSaveRow}
        onDeleteRow={onDeleteRow}
        createRowData={createRowData}
        loading={loading}
      />
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
  },
  {
    field: 'last_name',
    headerName: 'Nom',
    width: 150,
    headerAlign: 'left',
    type: 'string',
    editable: true,
  },
  {
    field: 'phone',
    headerName: 'Téléphone',
    width: 150,
    headerAlign: 'left',
    type: 'string',
    editable: true,
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
    field: 'dateCreated',
    headerName: 'Date creation',
    width: 150,
    headerAlign: 'left',
    type: 'date',
    editable: false,
    align: 'center',
    renderCell: ({ value }) => moment(value).format('DD/MM//yyyy'),
  },
];
