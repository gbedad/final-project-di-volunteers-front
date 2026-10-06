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

// Toolbar of the dashboard grid (texts in French through the grid's
// localeText). No "Add record": the rows it added were never saved.
const DashboardToolbar = () => (
  <GridToolbarContainer>
    <GridToolbarColumnsButton />
    <GridToolbarFilterButton />
    <GridToolbarDensitySelector />
    <GridToolbarExportContainer>
      {/* ";" and a BOM: opens directly with the accents in French Excel */}
      <GridCsvExportMenuItem
        options={{
          fileName: 'benevoles-mycogniverse',
          delimiter: ';',
          utf8WithBom: true,
        }}
      />
    </GridToolbarExportContainer>
    <GridToolbarQuickFilter sx={{ width: 260 }} />
  </GridToolbarContainer>
);

export default DashboardToolbar;
