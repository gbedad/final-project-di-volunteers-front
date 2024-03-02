import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import utc from 'dayjs/plugin/utc';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Input from 'react-phone-number-input/input';
import CustomPhoneNumber from '../components/phone-numbers/PhoneNumber';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import { FormControl, InputLabel } from '@mui/material';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import 'react-phone-number-input/style.css';
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
        Association Séphora Berrebi by Gérald Berrebi
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}
dayjs.extend(customParseFormat);
const BASE_URL = process.env.REACT_APP_BASE_URL;
const theme = createTheme();

const RegisterForm = ({ mission }) => {
  const location = useLocation();
  const propsData = location.state;
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [birth_date, setBirthDate] = useState(new Date());
  const [message, setMessage] = useState('');

  dayjs.locale('fr');
  dayjs.extend(utc);
  // dayjs.utc(); // results in date in correct timezone

  const isStrongPassword = () => {
    // Define the criteria for a strong password
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(password);

    // Check if the password meets all criteria
    return (
      password.length >= minLength &&
      hasUppercase &&
      hasLowercase &&
      hasNumber &&
      hasSpecialChar
    );
  };
  const isEmailValid = () => {
    return email.includes('@');
  };

  const isPhoneValid = () => {
    return phone.trim() !== '';
  };

  const isBirthDateValid = () => {
    return birth_date.trim() !== '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEmailValid()) {
      toast.error('Veuillez saisir une adresse e-mail valide.', {
        position: 'top-center',
      });
      return;
    }

    if (!isStrongPassword()) {
      toast.error("Votre mot de passe n'est pas assez sécurisé.", {
        position: 'top-center',
      });
      return;
    }

    if (!isPhoneValid()) {
      toast.error('Veuillez saisir un numéro de téléphone valide.', {
        position: 'top-center',
      });
      return;
    }

    if (!isBirthDateValid()) {
      toast.error('Veuillez sélectionner une date de naissance valide.', {
        position: 'top-center',
      });
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/register`, {
        email,
        password,
        first_name,
        last_name,
        phone,
        birth_date,
        message,
        mission_id: propsData,
      });

      if (!isStrongPassword)
        return toast.error("Votre mot de passe n'est pas assez sécurisé.", {
          position: 'top-center',
        });
      // console.log(response.data); // Handle successful response here
      navigate('/login');
    } catch (error) {
      console.error(error); // Handle error here
      if (error) {
        // Assuming 409 is the status code for email already existing
        toast.error('Email already exists. Please use a different email.', {
          position: 'top-center',
        });
      } else {
        toast.error('An error occurred. Please try again later.', {
          position: 'top-center',
        });
      }
    }
  };

  return (
    <>
      <ToastContainer />
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
              {/* S'inscrire pour la mission {propsData} */}
              Créer un compte
            </Typography>
            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit}
              sx={{ mt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    autoComplete="given-name"
                    name="first_name"
                    required
                    fullWidth
                    id="firstName"
                    label="Prénom"
                    autoFocus
                    value={first_name}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="last_name"
                    label="Nom"
                    name="lastName"
                    autoComplete="family-name"
                    value={last_name}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Input
                    international
                    withCountryCallingCode
                    defaultCountry="FR"
                    placeholder="Téléphone"
                    value={phone}
                    onChange={setPhone}
                    style={{ innerHeight: '40px' }}
                    inputComponent={CustomPhoneNumber}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InputLabel id="demo-simple-select-helper-label"></InputLabel>
                  <TextField
                    required={true}
                    fullWidth
                    size="normal"
                    label="Date de naissance"
                    type="date"
                    value={birth_date}
                    // error={!isDateValid}
                    // helperText={!isDateValid && 'Please select a valid date.'}
                    onChange={(e) => setBirthDate(e.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <PasswordInput
                    password={password}
                    handlePassword={(e) => setPassword(e.target.value)}
                  />
                  <Typography
                    color={isStrongPassword() ? 'success' : 'secondary'}
                    variant={'body2'}>
                    {isStrongPassword()
                      ? 'Mot de passe valide'
                      : 'Le mot de passe doit contenir au moins 8 caractères dont des majuscules, des chiffres et des caractères spéciaux'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextareaAutosize
                    required
                    id="message"
                    label="Motivation"
                    name="message"
                    aria-label="minimum height"
                    minRows={5}
                    placeholder="Pourquoi souhaitez-vous être bénévole ?"
                    style={{ width: 400, fontFamily: 'Roboto' }}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </Grid>
                {/* <Grid item xs={12}>
                  <Box sx={{ fontSize: '12px' }}>
                    <FormControlLabel
                      style={{ fontSize: '13px' }}
                      control={
                        <Checkbox value="allowExtraEmails" color="primary" />
                      }
                      label="Cliquez ici pour indiquer que vous avez lu et accepté les conditions présentées dans les conditions générales."
                    />
                  </Box>
                </Grid> */}
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}>
                S'inscrire
              </Button>
              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Link href="/login" variant="body2">
                    J'ai déjà un compte ? Se connecter
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
          <Copyright sx={{ mt: 5 }} />
        </Container>
        {/* </ThemeProvider> */}
      </>
    </>
  );
};

export default RegisterForm;
