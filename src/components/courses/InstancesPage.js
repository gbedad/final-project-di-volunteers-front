import React from 'react';
import { DataGrid, GridRowsProp, GridColDef } from '@mui/x-data-grid';

const InstancesPage = () => {
  //   const courses = JSON.parse(localStorage.getItem('instances'));
  //   let instan = [];

  //   const allInstances = courses.map((instance) => {
  //     return instance.instances.map((item) => {
  //       return item;
  //     });
  //   });
  //   const rows = allInstances;
  //   console.log(rows);
  //   const getRowId = (row) => row.id;
  const courses = JSON.parse(localStorage.getItem('instances'));
  const instances = courses.flatMap((course) => course.instances);

  const getRowId = (row) => row.id;

  const columns = [
    { field: 'id', headerName: 'Instance Id', width: 150 },
    { field: 'datetime', headerName: 'Jour prévu', width: 150 },
    { field: 'startTime', headerName: 'Heure début', width: 150 },
    { field: 'endTime', headerName: 'Heure fin', width: 150 },

    { field: 'room', headerName: 'Salle', width: 150 },
    { field: 'location', headerName: 'Lieu', width: 350 },
  ];

  return (
    <div>
      <h3>Instances des cours</h3>
      <div>
        <DataGrid rows={instances} columns={columns} getRowId={getRowId} />
      </div>
    </div>
  );
};

export default InstancesPage;
