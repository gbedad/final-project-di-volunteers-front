import React, { useState } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
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
import { useAuth } from '../AuthContext';
import PasswordInput from './PasswordInput';

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
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);

      if (success) {
        const userLogged = JSON.parse(localStorage.getItem('user'));

        toast.success(`Bonjour ${userLogged.first_name}`, {
          duration: 6000,
          position: 'top-center',
          icon: '🚀',
        });

        if (userLogged.role === 'volunteer') {
          navigate('/stepper', { state: { userLogged } });
        } else if (
          userLogged.role === 'admin' ||
          userLogged.role === 'interviewer'
        ) {
          navigate('/admin', { state: { userLogged } });
        } else {
          // Navigate to a default route if role is not recognized
          navigate('/');
        }
      } else {
        toast.error(`Utilisateur ou mot de passe incorrect`, {
          position: 'top-center',
        });
      }
    } catch (err) {
      console.error(err);
      toast.error(`Une erreur s'est produite. Veuillez réessayer.`, {
        position: 'top-center',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <PasswordInput
              password={password}
              handlePassword={(e) => setPassword(e.target.value)}
            />
            <Button
              color="primary"
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}>
              {isLoading ? 'Connexion...' : 'Se connecter'}
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
                <Link component={RouterLink} to="/register" variant="body2">
                  Vous n'avez pas de compte ?
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
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
  );
}
