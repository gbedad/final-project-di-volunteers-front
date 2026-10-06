import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { styled } from '@mui/system';
import toast, { Toaster } from 'react-hot-toast';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import { TextareaAutosize as BaseTextareaAutosize } from '@mui/base/TextareaAutosize';

import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import utc from 'dayjs/plugin/utc';

import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
// import { createTheme } from '@mui/material/styles';
import Input from 'react-phone-number-input/input';
import CustomPhoneNumber from '../components/phone-numbers/PhoneNumber';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import { Alert, FormHelperText, InputLabel } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { Link as RouterLink } from 'react-router-dom';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import 'react-phone-number-input/style.css';
import PasswordInput from './PasswordInput';
import MotivationCounter, {
  MOTIVATION_MIN,
  MOTIVATION_MAX,
} from './MotivationCounter';

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

const Textarea = styled(BaseTextareaAutosize)(
  () => `
    box-sizing: border-box;
    width: 100%;
    font-family: 'Roboto', sans-serif;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    padding: 8px 12px;
    border-radius: 4px;
    
    background: transparent;
    border: 1px solid rgba(20, 20, 20, 0.5) ;
    
    &:focus {
      border-color: black;
      
    }

    // firefox
    &:focus-visible {
      outline: 0;
    }
  `
);

dayjs.extend(customParseFormat);
const BASE_URL = process.env.REACT_APP_BASE_URL;

console.log(BASE_URL);
// const theme = createTheme();

const RegisterForm = ({ mission }) => {
  const location = useLocation();
  const propsData = location.state;
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [birth_date, setBirthDate] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [emailTaken, setEmailTaken] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  dayjs.locale('fr');
  dayjs.extend(utc);

  const passwordRules = [
    { label: '8 caractères minimum', ok: password.length >= 8 },
    { label: 'une majuscule', ok: /[A-Z]/.test(password) },
    { label: 'une minuscule', ok: /[a-z]/.test(password) },
    { label: 'un chiffre', ok: /\d/.test(password) },
    {
      label: 'un caractère spécial (!@#$%…)',
      ok: /[!@#$%^&*()_+{}[\]:;<>,.?~\\/-]/.test(password),
    },
  ];
  const isStrongPassword = () => passwordRules.every((rule) => rule.ok);

  const ageOf = (date) => dayjs().diff(dayjs(date), 'year');

  // Returns a message per invalid field, empty object if the form is valid
  const validate = () => {
    const found = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      found.email = 'Adresse e-mail invalide';
    }
    if (!first_name.trim()) found.first_name = 'Prénom requis';
    if (!last_name.trim()) found.last_name = 'Nom requis';
    if (!phone || phone.replace(/\D/g, '').length < 9) {
      found.phone = 'Numéro de téléphone invalide';
    }
    if (!birth_date) {
      found.birth_date = 'Date de naissance requise';
    } else if (ageOf(birth_date) < 18) {
      found.birth_date = 'Vous devez avoir au moins 18 ans';
    } else if (ageOf(birth_date) > 100) {
      found.birth_date = 'Date de naissance invalide';
    }
    if (!isStrongPassword()) {
      found.password = 'Le mot de passe ne respecte pas toutes les règles';
    }
    if (message.trim().length < MOTIVATION_MIN) {
      found.message = `Dites-nous en quelques mots pourquoi vous postulez (${MOTIVATION_MIN} caractères minimum)`;
    } else if (message.trim().length > MOTIVATION_MAX) {
      found.message = `${MOTIVATION_MAX} caractères maximum`;
    }
    return found;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailTaken(false);

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast.error('Merci de corriger les champs indiqués en rouge.', {
        position: 'top-center',
      });
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${BASE_URL}/register`, {
        email: email.trim(),
        password,
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        phone,
        birth_date,
        message,
        mission_id: typeof propsData === 'number' ? propsData : 1,
      });
      toast.success('Votre compte est créé, vous pouvez vous connecter.', {
        duration: 6000,
        position: 'top-center',
      });
      navigate('/login', { state: { email: email.trim() } });
    } catch (error) {
      if (error.response?.status === 409) {
        setEmailTaken(true);
      } else {
        toast.error(
          'Une erreur est survenue. Merci de réessayer dans quelques instants.',
          { position: 'top-center' }
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* <ThemeProvider theme={theme}> */}
      <>
        <Toaster />
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
                    autoFocus
                    required
                    fullWidth
                    id="email"
                    label="Email"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={!!errors.email}
                    helperText={errors.email}
                  />
                  {emailTaken && (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      Un compte existe déjà avec cet e-mail.{' '}
                      <Link component={RouterLink} to="/login">
                        Se connecter
                      </Link>{' '}
                      ou{' '}
                      <Link component={RouterLink} to="/forgot-password">
                        réinitialiser le mot de passe
                      </Link>
                      .
                    </Alert>
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    autoComplete="given-name"
                    name="first_name"
                    required
                    fullWidth
                    id="firstName"
                    label="Prénom"
                    value={first_name}
                    onChange={(e) => setFirstName(e.target.value)}
                    error={!!errors.first_name}
                    helperText={errors.first_name}
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
                    error={!!errors.last_name}
                    helperText={errors.last_name}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Input
                    required
                    international
                    withCountryCallingCode
                    defaultCountry="FR"
                    placeholder="Téléphone"
                    value={phone}
                    onChange={setPhone}
                    style={{ innerHeight: '40px' }}
                    inputComponent={CustomPhoneNumber}
                  />
                  {errors.phone && (
                    <FormHelperText error>{errors.phone}</FormHelperText>
                  )}
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
                    error={!!errors.birth_date}
                    helperText={errors.birth_date}
                  />
                </Grid>

                <Grid item xs={12}>
                  <PasswordInput
                    password={password}
                    handlePassword={(e) => setPassword(e.target.value)}
                  />
                  <Box component="ul" sx={{ listStyle: 'none', pl: 0, mt: 1, mb: 0 }}>
                    {passwordRules.map((rule) => (
                      <Box
                        component="li"
                        key={rule.label}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          fontSize: '0.85rem',
                          color: rule.ok
                            ? 'success.main'
                            : errors.password
                            ? 'error.main'
                            : 'text.secondary',
                        }}>
                        {rule.ok ? (
                          <CheckCircleIcon sx={{ fontSize: 16 }} />
                        ) : (
                          <RadioButtonUncheckedIcon sx={{ fontSize: 16 }} />
                        )}
                        {rule.label}
                      </Box>
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Textarea
                    required
                    id="message"
                    label="Motivation"
                    name="message"
                    aria-label="minimum height"
                    minRows={5}
                    placeholder="Pourquoi souhaitez-vous être bénévole ?"
                    value={message}
                    maxLength={MOTIVATION_MAX}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <MotivationCounter value={message} />
                  {errors.message && (
                    <FormHelperText error>{errors.message}</FormHelperText>
                  )}
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
                disabled={submitting}
                sx={{ mt: 3, mb: 2 }}>
                Créer mon compte pour postuler
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
          {/* <Copyright sx={{ mt: 5 }} /> */}
        </Container>
        {/* </ThemeProvider> */}
      </>
    </>
  );
};

export default RegisterForm;
