import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { TextField, Button } from '@mui/material';
// import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Snackbar from '@mui/material/Snackbar';

import Grid from '@mui/material/Grid';

import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';

import LockOpenIcon from '@mui/icons-material/LockOpen';
import Avatar from '@mui/material/Avatar';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// import { UserContext } from '../UserContext';

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

// const Alert = React.forwardRef(function Alert(props, ref) {
//   return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
// });

// const theme = createTheme();
const BASE_URL = process.env.REACT_APP_BASE_URL;

const ResetPasswordForm = async () => {
  const { id, token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [open, setOpen] = React.useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  try {
    if (newPassword === confirmPassword) {
      const response = await fetch(
        `/${BASE_URL}/reset-password/${id}/${token}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            newPassword,
          }),
        }
      );

      const data = await response.json();
      if (data.status === 201) {
        setNewPassword('');
        setConfirmPassword('');
      }
    }
  } catch (error) {
    toast.error('An error occurred. Please try again later.', {
      position: 'top-center',
    });
  }

  // Reset the form fields

  const handleCloseSnackbar = () => {
    setOpen(false);
  };

  return (
    // <ThemeProvider theme={theme}>
    <>
      <ToastContainer />
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
          <Typography></Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  type="password"
                  label="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
              fullWidth>
              Renouveler
            </Button>
          </Box>
          <Snackbar
            severity="success"
            open={open}
            onClose={handleCloseSnackbar}
            autoHideDuration={5000}
            message="An email has been sent to your account. Please check your inbox."></Snackbar>
        </Box>

        <Copyright sx={{ mt: 8, mb: 4 }} />
      </Container>
    </>
    // </ThemeProvider>
  );
};

export default ResetPasswordForm;
