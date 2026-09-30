import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import axios from 'axios';
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
