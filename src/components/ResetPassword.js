import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, NavLink, useHistory } from 'react-router-dom';
import axios from 'axios';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import ResetPasswordForm from './ResetPasswordForm';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CssBaseline from '@mui/material/CssBaseline';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MuiAlert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import Avatar from '@mui/material/Avatar';

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
const theme = createTheme();

const ResetPassword = () => {
  const { id, token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');

  const userValid = async () => {
    try {
      const res = await fetch(
        `reset-password/${id}/${token}`,

        {
          method: 'GET',

          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(res);

      if (res.ok) {
        console.log('user valid');
      } else {
        navigate('*');
      }
    } catch (error) {
      console.log(error);
      navigate('*');
    } finally {
      setLoading(false);
    }
  };

  const sendPassword = async (event) => {
    event.preventDefault();

    if (password === '') {
      toast.error('Password is required!', {
        position: 'top-center',
      });
    } else if (password !== confirmPassword) {
      toast.error('Passwords must match', {
        position: 'top-center',
      });
    } else {
      try {
        const res = await fetch(
          `${BASE_URL}/reset-password/${id}/${token}`,

          {
            method: 'POST',
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },

            body: JSON.stringify({ password }),
          }
        );
        const data = await res.json();
        console.log(data);

        if (data.status === 201) {
          setPassword('');
          setConfirmPassword('');
          setMessage(true);
          toast.success('Votre mot de passe a été renouvelé', {
            position: 'top-center',
          });
          setTimeout(() => {
            navigate('/login');
          }, 1000);
        } else {
          toast.error('Token expired, generate a new link', {
            position: 'top-center',
          });
        }
      } catch (error) {
        console.log(error);
        toast.error('Something went wrong', {
          position: 'top-center',
        });
      }
    }
  };

  useEffect(() => {
    userValid();
  }, []);

  return (
    <>
      {!loading ? (
        <div>
          <ToastContainer />
          <ThemeProvider theme={theme}>
            <Container component="main" maxWidth="xs">
              <CssBaseline />
              <Box
                sx={{
                  marginTop: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}>
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                  <LockOpenIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                  Renouveler mon mot de passe
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
                    Renouveller
                  </Button>
                </Box>
              </Box>

              <Copyright sx={{ mt: 8, mb: 4 }} />
            </Container>
          </ThemeProvider>
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
