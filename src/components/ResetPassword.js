import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import CssBaseline from '@mui/material/CssBaseline';

import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import Avatar from '@mui/material/Avatar';

import { isStrongPassword } from '../js/isStrongPassword';

const BASE_URL = process.env.REACT_APP_BASE_URL;

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Association Séphora Berrebi{' '}
      </Link>
      <br />
      by Gerald Berrebi {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}
// const theme = createTheme();

const ResetPassword = () => {
  const { id, token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const validateUser = async () => {
    try {
      const res = await fetch(`/reset-password/${id}/${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.headers.get('Content-Type')?.includes('application/json')) {
        const data = await res.json();
        setEmail(data.email);
        setIsTokenValid(true);
        setIsNewUser(!data.hasPassword);
        setIsEmailVerified(data.isEmailVerified);
      } else {
        // Handle non-JSON response
        console.error('Unexpected response format from server');
        setIsTokenValid(false);
        setIsNewUser(false);
        setIsEmailVerified(false);
      }
    } catch (error) {
      console.log(error);
      setIsTokenValid(false);
      setIsNewUser(false);
      setIsEmailVerified(false);
    } finally {
      setLoading(false);
    }
  };

  const sendPassword = async (event) => {
    event.preventDefault();

    if (password === '') {
      console.log('Password is required!');
    } else if (!isStrongPassword(password)) {
      return console.log("Votre mot de passe n'est pas assez sécurisé.");
    } else if (password !== confirmPassword) {
      console.log('Passwords must match');
    } else if (!isEmailVerified) {
      console.log('Email must be verified before resetting password');
    } else {
      try {
        const res = await fetch(`/reset-password/${id}/${token}`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ password }),
        });

        if (res.headers.get('Content-Type')?.includes('application/json')) {
          const data = await res.json();
          if (data.status === 201) {
            setPassword('');
            setConfirmPassword('');
            setMessage(true);
            console.log('Votre mot de passe a été renouvelé');
            setTimeout(() => {
              navigate('/login');
            }, 1000);
          } else {
            console.log('Something went wrong');
          }
        } else {
          // Handle non-JSON response
          console.error('Unexpected response format from server');
        }
      } catch (error) {
        console.log(error);
        console.log('Something went wrong');
      }
    }
  };

  useEffect(() => {
    validateUser();
  }, []);

  return (
    <>
      {!loading ? (
        <div>
          {isTokenValid && isEmailVerified ? (
            <Box>
              <Typography component="h1" variant="h5">
                {isNewUser ? 'Set a New Password' : 'Reset Your Password'}
              </Typography>
              <Typography>{email}</Typography>
              <Box sx={{ mt: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      type="password"
                      label="New Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      type="password"
                      label="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      fullWidth
                    />
                  </Grid>
                </Grid>
                <Button
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  type="submit"
                  onClick={sendPassword}
                  fullWidth>
                  {isNewUser ? 'Set Password' : 'Reset Password'}
                </Button>
              </Box>
            </Box>
          ) : (
            <Box>
              <Typography variant="h5">Invalid or Expired Link</Typography>
              <Typography>
                The password reset link you've provided is invalid or has
                expired. Please request a new password reset link.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/forgot-password')}>
                Request New Link
              </Button>
            </Box>
          )}
        </div>
      ) : (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}>
          Loading... &nbsp;
          <CircularProgress />
        </Box>
      )}
    </>
  );
};

export default ResetPassword;
