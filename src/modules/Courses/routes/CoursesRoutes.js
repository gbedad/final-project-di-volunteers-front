// Courses/routes/CoursesRoutes.js
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import CourseList from '../components/CourseList';
import CourseDetails from '../components/CourseDetails';

const CoursesRoutes = () => {
  return (
    <Routes>
      <Route exact path="/courses" element={<CourseList />} />
      <Route path="/courses/:id" element={<CourseDetails />} />
      {/* Add more routes for courses module */}
    </Routes>
  );
};

export default CoursesRoutes;
