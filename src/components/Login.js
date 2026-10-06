import React, { useState, useContext, useEffect } from 'react';
import {
  useNavigate,
  useLocation,
  useSearchParams,
  Link as RouterLink,
} from 'react-router-dom';

import axios from 'axios';

import toast, { Toaster } from 'react-hot-toast';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';

import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

// import { createTheme } from '@mui/material/styles';

import { AuthContext } from '../AuthContext';

import PasswordInput from './PasswordInput';
import CircularProgress from '@mui/material/CircularProgress';
import { isStaff } from '../js/roles';
import { refreshSession } from '../js/auth';

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
        by Gérald Berrebi {new Date().getFullYear()}
        {'.'}
      </p>
    </Typography>
  );
}

// const theme = createTheme();
const BASE_URL = process.env.REACT_APP_BASE_URL;

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  // ?candidat=<id>: link from the new-registration email to the admins
  const [searchParams] = useSearchParams();
  const candidateId = Number(searchParams.get('candidat')) || null;
  const { updateToken } = useContext(AuthContext);
  // const [userConnected, setUserConnected] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState(location.state?.email || '');
  // Link from an email: true while checking the session already open in
  // this browser, so the login form is only shown when really needed
  const [resuming, setResuming] = useState(!!candidateId);

  useEffect(() => {
    if (!candidateId) return;
    const openCandidate = (userLogged) =>
      navigate('/change-status', {
        replace: true,
        state: { userId: candidateId, userLogged },
      });
    const resume = async () => {
      let saved = null;
      try {
        saved = JSON.parse(localStorage.getItem('user'));
      } catch {}
      if (!saved?.token || !isStaff(saved.user?.role)) {
        setResuming(false);
        return;
      }
      try {
        await axios.get(`${BASE_URL}/check-token`);
        openCandidate(saved);
        return;
      } catch {}
      // Expired access token: try the refresh token before asking to log in
      const renewed = await refreshSession();
      if (renewed) {
        updateToken(renewed);
        openCandidate({ ...saved, token: renewed });
      } else {
        setResuming(false);
        toast('Votre session a expiré : connectez-vous pour ouvrir la fiche.', {
          position: 'top-center',
        });
      }
    };
    resume();
    // Only when arriving on the page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // const user = updateUser(userConnected);
  // console.log(user);
  const handleSubmit = async (event) => {
    event.preventDefault();
    // const data = new FormData(event.currentTarget);

    try {
      const response = await axios.post(`${BASE_URL}/login`, {
        // email: data.get('email'),
        // password: data.get('password'),
        email,
        password,
      });
      if (!response.data.token) {
        toast.error(`Utilisateur ou mot de passe incorrect`, {
          position: 'top-center',
        });
      }
      const userLogged = response.data;

      const token1 = response.data.token;
      const refreshToken = response.data.refreshToken;

      // console.log('Handlesubmit token');
      updateToken(token1);
      localStorage.setItem('token1', response.data.token);
      localStorage.setItem('refreshToken', refreshToken);

      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user-status', response.data.user.status);
        setIsLoading(false);

        // setUserConnected(userLogged)
        // updateUser(userLogged);
        toast.success(`Bonjour  ${userLogged.user.first_name}`, {
          duration: 6000,
          position: 'top-center',

          // Styling
          style: {},
          className: '',

          // Custom Icon
          icon: '🚀',

          // Change colors of success/error/loading icon
          iconTheme: {
            primary: 'light.main',
            secondary: '#fff',
          },
        });

        // console.log(userLogged, isLoading);
        if (userLogged.user.role === 'volunteer') {
          navigate('/stepper', { state: { userLogged } });
        } else if (
          ['superadmin', 'admin', 'interviewer'].includes(userLogged.user.role)
        ) {
          if (candidateId) {
            navigate('/change-status', {
              state: { userId: candidateId, userLogged },
            });
          } else {
            navigate('/view-users', { state: { userLogged } });
          }
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

  if (resuming) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 20 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {/* <ThemeProvider theme={theme}> */}
      <>
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
              Se connecter
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
                email={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {/* <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
              /> */}
              <PasswordInput
                password={password}
                handlePassword={(e) => setPassword(e.target.value)}
              />
              {/* <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
              /> */}
              <Button
                color="primary"
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}>
                Se connecter
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link
                    component={RouterLink}
                    to="/forgot-password"
                    variant="body2">
                    Mot de passe oublié ?
                  </Link>
                </Grid>

                <Grid item>
                  {/* <Link href="/register" variant="body2">
                    {"Vous n'avez pas de compte ?"}
                  </Link> */}
                  <Link component={RouterLink} to="/register" variant="body2">
                    Vous n'avez pas de compte ?
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
          {/* <Copyright sx={{ mt: 8, mb: 4 }} /> */}
        </Container>
        {/* </ThemeProvider> */}

        <Toaster
          toastOptions={{
            success: {
              iconTheme: {
                primary: 'green',
                secondary: 'black',
              },
            },
          }}
        />
      </>
    </>
  );
}
