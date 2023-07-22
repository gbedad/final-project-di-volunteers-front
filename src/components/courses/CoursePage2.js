import React from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Edit } from '@mui/icons-material';

const NUMBER_OF_ROWS = 2;

const MuiDataGrid = () => {
  const rows = Array.apply(null, Array(NUMBER_OF_ROWS)).map((_elem, i) => ({
    id: `id-${i}`,
    col1: `col1 row${i}`,
    col2: `col2 row${i}`,
  }));
  const columns = [
    { field: 'id', headerName: 'ID' },
    {
      field: 'col1',
      headerName: 'Col 1',
      editable: true,
    },
    {
      field: 'col2',
      headerName: 'Col 2',
      editable: true,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      editable: false,
      renderCell: (params) => (
        <Edit
          onClick={() => {
            params.api.setRowMode(params.id, 'edit');
          }}
          sx={{ cursor: 'pointer' }}
        />
      ),
    },
  ];

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      editMode="row"
      autoHeight
      disableSelectionOnClick
    />
  );
};

export default MuiDataGrid;
