// src/components/AdminModule.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLanding from './AdminLanding';
import AllUsers from '../../../../components/AllUsers';

import ChangeUserStatus from '../../../../components/ChangeUserStatus';
import Stepper from '../../../../components/Stepper';
import ManageGrid from '../StudentDashbord1/StudentGrid';
import BeneficiaryPage from '../../StudentDashbord1/pages/studentDemand';
import { SchoolAutocomplete } from '../SchoolAutocomplete';
// import Reports from './Reports';
// import Settings from './Settings';
// import Analytics from './Analytics';
// Test

const AdminModule = () => {
  console.log('Admin routes rendered');
  return (
    <Routes>
      <Route path="" element={<AdminLanding />} />
      <Route path="view-users" element={<AllUsers />} />
      <Route path="change-status" element={<ChangeUserStatus />} />
      <Route path="stepper" element={<Stepper />} />
      <Route path="student-grid" element={<ManageGrid />} />
      <Route path="student-demand/:id" element={<BeneficiaryPage />} />
      <Route path="schools" element={<SchoolAutocomplete />} />
      {/* <Route path="settings" element={<Settings />} />
      <Route path="analytics" element={<Analytics />} /> */}

      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
};

export default AdminModule;
