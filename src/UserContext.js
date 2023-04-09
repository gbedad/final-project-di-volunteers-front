import React, { createContext, useState } from 'react';

// Create the UserContext
export const UserContext = createContext();

// Create a UserProvider component to provide the context value
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({}); // State to store user information

  // Function to update user information
  const updateUser = (userData) => {
    setUser(userData);
    // You can return a value here if needed
    return userData;
  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
    {children}
  </UserContext.Provider>
  );
};
