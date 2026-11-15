import React from 'react';
import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarExportContainer,
  GridToolbarFilterButton,
  GridCsvExportMenuItem,
} from '@mui/x-data-grid';

// Toolbar of the dashboard grid (texts in French through the grid's
// localeText); the search by name is above the table. No "Add record": the
// rows it added were never saved.
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
  </GridToolbarContainer>
);

export default DashboardToolbar;
