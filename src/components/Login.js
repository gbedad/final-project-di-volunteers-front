import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { AuthContext } from '../AuthContext';

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Association Séphora Berrebi
      </Link>{' '}
      <p>
        by Gerald Berrebi {new Date().getFullYear()}
        {'.'}
      </p>
    </Typography>
  );
}

const theme = createTheme();
const BASE_URL = process.env.REACT_APP_BASE_URL;

export default function SignIn() {
  const navigate = useNavigate();
  const { updateToken } = useContext(AuthContext);
  const [userConnected, setUserConnected] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // const user = updateUser(userConnected);
  // console.log(user);
  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    try {
      const response = await axios.post(`${BASE_URL}/login`, {
        email: data.get('email'),
        password: data.get('password'),
      });
      if (!response.data.token) {
        toast.error(`Utilisateur ou mot de passe incorrect`, {
          position: 'top-center',
        });
      }
      const userLogged = response.data;

      const token = response.data.token;

      console.log('Handlesubmit token');
      updateToken(token);
      localStorage.setItem('token1', response.data.token);

      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user-status', response.data.user.status);
        setIsLoading(false);

        // setUserConnected(userLogged)
        // updateUser(userLogged);
        toast.success(`Bon retour  ${userLogged.first_name}`, {
          position: 'top-center',
        });

        console.log(userLogged, isLoading);
        if (userLogged.user.role === 'volunteer') {
          navigate('/stepper', { state: { userLogged } });
        } else if (userLogged.user.role === 'admin') {
          navigate('/view-users', { state: { userLogged } });
        } else {
          console.log('Loading.....');
        }
      }
    } catch (err) {
      console.log(err);
      toast.error(`Utilisateur ou mot de passe incorrect`, {
        position: 'top-center',
      });
    }
  };

  return (
    <>
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
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>

            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
              />
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}>
                Sign In
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link href="/forgot-password" variant="body2">
                    Mot de passe oublié ?
                  </Link>
                </Grid>
                <Grid item>
                  {/* <Link href="/register" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link> */}
                </Grid>
              </Grid>
            </Box>
          </Box>
          <Copyright sx={{ mt: 8, mb: 4 }} />
        </Container>
      </ThemeProvider>
    </>
  );
}
