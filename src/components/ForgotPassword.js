import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';

import Link from '@mui/material/Link';

import Box from '@mui/material/Box';

import LockResetIcon from '@mui/icons-material/LockReset';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

// import { AuthContext } from '../AuthContext';

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Association Séphora Berrebi by Gerald Berrebi
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

// const theme = createTheme();
const BASE_URL = process.env.REACT_APP_BASE_URL;

export default function ForgotPassword() {
  const navigate = useNavigate();
  // const { updateUser } = useContext(AuthContext);
  // const [userConnected, setUserConnected] = useState({});

  const [email, setEmail] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    // setIsLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/forgot-password`, {
        email,
      });

      console.log(response.data);
      if (response.data.status === 201) {
        // localStorage.setItem("user", JSON.stringify(response.data))
        // localStorage.setItem('token', response.data.token);
        // console.log(response.data);
        // setIsLoading(false);
        // setOpen(true);
        toast.success(
          'Un email vous a été adressé pour renouveler votre mot de passe. Vérifiez votre boite mail',
          {
            position: 'top-center',
          }
        );
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        toast.error('Invalid User', {
          position: 'top-center',
        });
      }
      //   console.log(userLogged, isLoading);
      //   if (userLogged.user.role === 'volunteer') {
      //     navigate('/stepper', { state: { userLogged } });
      //   } else if (userLogged.user.role === 'admin') {
      //     navigate('/view-users', { state: { userLogged } });
      //   } else {
      //     console.log('Loading.....');
      //     return <div>Loading...</div>;
      //   }
      // }
    } catch (err) {
      console.log(err);
    }
  };

  // console.log(email);

  return (
    // <ThemeProvider theme={theme}>
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
            <LockResetIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Mot de passe oublié
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}>
              Demande de nouveau mot de passe
            </Button>
          </Box>
          <Toaster />
        </Box>
        {/* <Copyright sx={{ mt: 8, mb: 4 }} /> */}
      </Container>
      {/* </ThemeProvider> */}
    </>
  );
}
