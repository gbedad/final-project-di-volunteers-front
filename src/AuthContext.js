import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
    // console.log(storedToken);
  }, []);

  // const login = (token) => {
  //   setIsLoggedIn(true);
  //   setToken(token);
  //   localStorage.setItem('token', token);
  // };
  const login = async (email, password) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/login`,
        {
          email,
          password,
        }
      );
      setUser(response.data);
    } catch (error) {
      console.error(error);
    }
  };
  // const logout = () => {
  //   setIsLoggedIn(false);
  //   setToken('');
  //   localStorage.removeItem('token');
  // };
  const logout = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_BASE_URL}/logout`,
        {},
        { withCredentials: true }
      );
      setUser(null);
    } catch (error) {
      console.error(error);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/refresh-token`,
        {
          refreshToken: localStorage.getItem('refreshToken'),
        }
      );
      setUser((prevUser) => ({
        ...prevUser,
        accessToken: response.data.accessToken,
      }));
    } catch (error) {
      console.error(error);
      setUser(null);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      refreshToken();
    }, 5 * 60 * 1000); // Refresh every 60 minutes

    return () => clearInterval(interval);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, token, login, logout, updateToken, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
