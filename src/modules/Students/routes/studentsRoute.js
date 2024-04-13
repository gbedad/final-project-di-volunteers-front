// Students/routes/StudentsRoutes.js
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import StudentList from '../components/StudentList';
import StudentDetails from '../components/StudentDetails';

const StudentsRoutes = () => {
  return (
    <Switch>
      <Route exact path="/students" component={StudentList} />
      <Route path="/students/:id" component={StudentDetails} />
      {/* Add more routes for students module */}
    </Switch>
  );
};

export default StudentsRoutes;
