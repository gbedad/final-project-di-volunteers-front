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
  const [isInitialLoad, setIsInitialLoad] = useState(true); // New state to track initial load

  const checkTokenAndRedirect = (token) => {
    if (isInitialLoad) {
      setIsInitialLoad(false); // Update state to indicate the initial load is complete
      return; // Skip redirection on initial load
    }
    if (!token || isTokenExpired(token)) {
      logout();
    } else {
      setIsLoggedIn(true);
      setToken(token);
    }
  };
  const updateToken = (newToken) => {
    setToken(newToken);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setIsLoggedIn(true);
      setToken(storedToken);
      setIsInitialLoad(false); // Set initial load as complete if token is found
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/login`,
        { email, password }
      );
      localStorage.setItem('token', response.data.token); // Assume the token is returned here
      setIsLoggedIn(true);
      setToken(response.data.token);
      setUser(response.data.user); // Assuming response contains user data
    } catch (error) {
      console.error(error);
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setToken(null);
    setUser(null);
    localStorage.clear(); // Clear all local storage
    navigate('/login');
  };

  const refreshToken = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/refresh-token`,
        { refreshToken: localStorage.getItem('refreshToken') }
      );
      localStorage.setItem('token', response.data.accessToken);
      setToken(response.data.accessToken);
    } catch (error) {
      console.error(error);
      logout(); // Logout if refresh fails
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem('token');
      checkTokenAndRedirect(currentToken);
    }, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, [user]); // Depend on user state

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        token,
        login,
        logout,
        updateToken,
        refreshToken,
        user,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };

// import { createContext, useContext, useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';

// import { isTokenExpired } from './js/auth';

// const AuthContext = createContext();

// export const useAuth = () => useContext(AuthContext);

// const AuthProvider = ({ children }) => {
//   const navigate = useNavigate();
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [token, setToken] = useState(null);
//   const [user, setUser] = useState(null);

//   const checkTokenAndRedirect = (token) => {
//     if (!token || isTokenExpired(token)) {
//       logout();
//     } else {
//       setIsLoggedIn(true);
//       setToken(token);
//     }
//   };

//   useEffect(() => {
//     const storedToken = localStorage.getItem('token');
//     checkTokenAndRedirect(storedToken);
//   }, []);

//   const updateToken = (newToken) => {
//     setToken(newToken);
//   };

//   useEffect(() => {
//     // Check if authentication state exists in local storage
//     const storedToken = localStorage.getItem('token');

//     if (storedToken) {
//       setIsLoggedIn(true);
//       setToken(storedToken);
//     }
//     // console.log(storedToken);
//   }, []);

//   const login = async (email, password) => {
//     try {
//       const response = await axios.post(
//         `${process.env.REACT_APP_BASE_URL}/login`,
//         { email, password }
//       );
//       localStorage.setItem('token', response.data.token); // Assume the token is returned here
//       checkTokenAndRedirect(response.data.token);
//     } catch (error) {
//       console.error(error);
//     }
//   };
//   // const login = async (email, password) => {
//   //   try {
//   //     const response = await axios.post(
//   //       `${process.env.REACT_APP_BASE_URL}/login`,
//   //       {
//   //         email,
//   //         password,
//   //       }
//   //     );
//   //     setUser(response.data);
//   //   } catch (error) {
//   //     console.error(error);
//   //   }
//   // };
//   const logout = () => {
//     setIsLoggedIn(false);
//     setToken('');
//     localStorage.removeItem('token');
//     localStorage.removeItem('token1');
//     localStorage.removeItem('user');
//     localStorage.removeItem('user-status');
//     localStorage.removeItem('refreshToken');

//     navigate('/login');
//   };
//   // const logout = async () => {
//   //   try {
//   //     await axios.post(
//   //       `${process.env.REACT_APP_BASE_URL}/logout`,
//   //       {}
//   //       // { withCredentials: true }
//   //     );
//   //     setUser(null);
//   //     setIsLoggedIn(false);
//   //     setToken('');
//   //     localStorage.removeItem('token');
//   //     window.location.href = '/login';
//   //   } catch (error) {
//   //     console.error(error);
//   //   }
//   // };
//   // const logout = useCallback(() => {
//   //   localStorage.removeItem('token'); // Remove the token from storage
//   //   window.location.href = '/login'; // Redirect to the login page
//   // }, []);

//   const refreshToken = async () => {
//     try {
//       const response = await axios.post(
//         `${process.env.REACT_APP_BASE_URL}/refresh-token`,
//         {
//           refreshToken: localStorage.getItem('refreshToken'),
//         }
//       );
//       setUser((prevUser) => ({
//         ...prevUser,
//         accessToken: response.data.accessToken,
//       }));
//     } catch (error) {
//       console.error(error);
//       setUser(null);
//     }
//   };

//   useEffect(() => {
//     const interval = setInterval(() => {
//       refreshToken();
//     }, 5 * 60 * 1000); // Refresh every 60 minutes

//     return () => clearInterval(interval);
//   }, [user]);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       const currentToken = localStorage.getItem('token');
//       checkTokenAndRedirect(currentToken);
//     }, 5 * 60 * 1000); // Refresh every 5 minutes

//     return () => clearInterval(interval);
//   }, [user]);

//   return (
//     <AuthContext.Provider
//       value={{ isLoggedIn, token, login, logout, updateToken, refreshToken }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export { AuthContext, AuthProvider };
