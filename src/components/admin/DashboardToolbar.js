import React from 'react';
import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarExportContainer,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
  GridCsvExportMenuItem,
} from '@mui/x-data-grid';
import GridExcelExportMenuItem from 'mui-datagrid-full-edit/dist/components/GridExcelExportMenuItem';

// Toolbar of the dashboard grid: same as the library's default one, without
// "Add record" (the rows it added were never saved)
const DashboardToolbar = ({ columns }) => (
  <GridToolbarContainer>
    <GridToolbarColumnsButton />
    <GridToolbarFilterButton />
    <GridToolbarDensitySelector />
    <GridToolbarExportContainer>
      <GridExcelExportMenuItem columns={columns} />
      <GridCsvExportMenuItem />
    </GridToolbarExportContainer>
    <GridToolbarQuickFilter />
  </GridToolbarContainer>
);

export default DashboardToolbar;
