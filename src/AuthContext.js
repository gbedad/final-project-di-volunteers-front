import { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);

  const updateToken = (newToken) => {
    setToken(newToken);
  };

  useEffect(() => {
    // Check if authentication state exists in local storage
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setIsLoggedIn(true);
      setToken(storedToken);
    }
  }, []);

  const login = (token) => {
    setIsLoggedIn(true);
    setToken(token);
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setToken('');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, token, login, logout, updateToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
