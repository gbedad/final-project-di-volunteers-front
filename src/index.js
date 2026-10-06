import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import axios from 'axios';
import { refreshSession } from './js/auth';
import { AuthProvider } from './AuthContext';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && !config.headers.Authorization && !config.headers.authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A request refused because the session has expired is sent again once the
// session is renewed (refresh token); if it can't be renewed, the error is
// marked so the page can ask to log in again
axios.interceptors.response.use(undefined, async (error) => {
  const config = error.config;
  const status = error.response?.status;
  const isAuthCall = /\/(login|refresh-token)$/.test(config?.url || '');
  if (status !== 401 || !config || config._retried || isAuthCall) {
    return Promise.reject(error);
  }
  config._retried = true;
  const token = await refreshSession();
  if (!token) {
    error.sessionExpired = true;
    return Promise.reject(error);
  }
  config.headers.Authorization = `Bearer ${token}`;
  return axios(config);
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
