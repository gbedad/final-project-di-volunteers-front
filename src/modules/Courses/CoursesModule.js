// CoursesModule.js
import React from 'react';
import CoursesRoutes from './routes/CoursesRoutes';
import CoursesSidebar from './components/CoursesSidebar';
import { Grid } from '@mui/material';

const CoursesModule = () => {
  return (
    <Grid container>
      <Grid item xs={3}>
        Courses Module
        {/* Courses sidebar or navigation menu */}
        <CoursesSidebar />
      </Grid>
      <Grid item xs={9}>
        {/* Courses routes */}
        <CoursesRoutes />
      </Grid>
    </Grid>
  );
};

export default CoursesModule;
