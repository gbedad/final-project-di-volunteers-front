import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { isTokenExpired } from './js/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkLoginStatus = () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser && !isTokenExpired(storedToken)) {
      setIsLoggedIn(true);
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    } else {
      setIsLoggedIn(false);
      setToken(null);
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const logout = () => {
    setIsLoggedIn(false);
    setToken(null);
    setUser(null);
    localStorage.clear();
    navigate('/login');
  };

  const updateToken = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/login`,
        { email, password }
      );

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setIsLoggedIn(true);
      setToken(response.data.token);
      setUser(response.data.user);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      checkLoginStatus();
    }, 10 * 60 * 1000); // Check every 10 minutes

    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, token, updateToken, login, logout, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
