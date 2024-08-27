// src/modules/core/components/PrivateRoute/index.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../../AuthContext'; // Adjust the import path as needed

const PrivateRoute = ({ children, requiredPermissions = [] }) => {
  const { isLoggedIn, user, loading } = useAuth();
  const location = useLocation();

  console.log('PrivateRoute - isLoggedIn:', isLoggedIn);
  console.log('PrivateRoute - user:', user);
  console.log('PrivateRoute - loading:', loading);

  // If still loading, show a loading indicator or return null
  if (loading) {
    return <div>Loading...</div>; // Or return null, or a loading spinner component
  }

  // Check if the user is logged in
  if (!isLoggedIn) {
    // Redirect to login if not logged in
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for required permissions
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requiredPermissions.some(
      (permission) => permission === user?.role
    );

    console.log('Required permissions:', requiredPermissions);
    console.log('User role:', user?.role);
    console.log('Has required permissions:', hasRequiredPermissions);

    if (!hasRequiredPermissions) {
      // Redirect to a forbidden page or home page if user doesn't have required permissions
      return <Navigate to="/" replace />;
    }
  }

  // If logged in and has required permissions, render the children
  return children;
};

export default PrivateRoute;
