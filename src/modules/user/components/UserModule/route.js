import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Stepper from '../../../../components/Stepper';
// import Reports from './Reports';
// import Settings from './Settings';
// import Analytics from './Analytics';

const UserModule = () => {
  return (
    <Routes>
      <Route path="stepper" element={<Stepper />} />

      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
};

export default UserModule;
