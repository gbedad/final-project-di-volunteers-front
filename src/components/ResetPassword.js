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

import PasswordInput from './PasswordInput';
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
  const [setMessage] = useState('');
  // const [open, setOpen] = useState(false);
  const [email] = useState('');

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
      console.log('Password is required!');
    } else if (!isStrongPassword(password)) {
      return console.log("Votre mot de passe n'est pas assez sécurisé.");
    } else if (password !== confirmPassword) {
      console.log('Passwords must match');
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

        if (res.status === 201) {
          setPassword('');
          setConfirmPassword('');
          // setMessage(true);
          console.log('Votre mot de passe a été renouvelé');
          setTimeout(() => {
            navigate('/login');
          }, 1000);
        } else {
          console.log('Token expired, generate a new link');
        }
      } catch (error) {
        console.log(error);
        console.log('Something went wrong');
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
          <>
            {/* <ThemeProvider theme={theme}> */}
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
                {/* <Typography>{email}</Typography> */}
                <Box sx={{ mt: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <PasswordInput
                        password={password}
                        handlePassword={(e) => setPassword(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <PasswordInput
                        password={confirmPassword}
                        handlePassword={(e) =>
                          setConfirmPassword(e.target.value)
                        }
                      />
                    </Grid>
                  </Grid>
                  <Button
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    type="submit"
                    onClick={sendPassword}
                    fullWidth>
                    {token === null ? 'Créer un mot de passe' : 'Renouveler'}
                  </Button>
                </Box>
              </Box>

              {/* <Copyright sx={{ mt: 8, mb: 4 }} /> */}
            </Container>
            ,
          </>
          {/* </ThemeProvider> */}
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
