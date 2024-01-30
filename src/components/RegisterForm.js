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

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      console.log(response.data); // Handle successful response here
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
    // <form onSubmit={handleSubmit}>
    //   <label>
    //     Email:
    //     <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
    //   </label>
    //   <br />
    //   <label>
    //     Password:
    //     <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
    //   </label>
    //   <br />
    //   <label>
    //     First Name:
    //     <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
    //   </label>
    //   <br />
    //   <label>
    //     Last Name:
    //     <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
    //   </label>
    //   <br />
    //   <label>
    //     Phone:
    //     <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required />
    //   </label>
    //   <br />
    //   <label>
    //     Birth Date:
    //     <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required />
    //   </label>
    //   <br />
    //   <label>
    //     Message:
    //     <textarea value={message} onChange={(e) => setMessage(e.target.value)} required />
    //   </label>
    //   <br />
    //   <button type="submit">Register</button>
    // </form>
    //   <form onSubmit={handleSubmit}>
    //   <TextField
    //     label="Email"
    //     type="email"
    //     variant="outlined"
    //     value={email}
    //     onChange={(e) => setEmail(e.target.value)}
    //     required
    //   />
    //   <br />
    //   <TextField
    //     label="Password"
    //     type="password"
    //     variant="outlined"
    //     value={password}
    //     onChange={(e) => setPassword(e.target.value)}
    //     required
    //   />
    //   <br />
    //   <TextField
    //     label="Birth Date"
    //     type="date"
    //     variant="outlined"
    //     value={birthDate}
    //     onChange={(e) => setBirthDate(e.target.value)}
    //     required
    //     InputLabelProps={{
    //       shrink: true,
    //     }}
    //   />
    //   <br />
    //   <TextField
    //     label="Message"
    //     multiline
    //     rows={4}
    //     variant="outlined"
    //     value={message}
    //     onChange={(e) => setMessage(e.target.value)}
    //     required
    //   />
    //   <br />
    //   <Button type="submit" variant="contained" color="primary">
    //     Register
    //   </Button>
    // </form>
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
              Sign up to mission {propsData}
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
                    label="Email Address"
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
                    label="First Name"
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
                    label="Last Name"
                    name="lastName"
                    autoComplete="family-name"
                    value={last_name}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  {/* <TextField
                  autoComplete="phone-number"
                  name="phone"
                  required
                  fullWidth
                  id="phone"
                  label="Phone Number"
                  autoFocus
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                /> */}
                  <Input
                    international
                    withCountryCallingCode
                    defaultCountry="FR"
                    placeholder="Phone number"
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
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Typography color={isStrongPassword() ? 'success' : 'error'}>
                    {isStrongPassword()
                      ? 'Strong Password'
                      : 'Password must be strong'}
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
                    placeholder="Motivation"
                    style={{ width: 400 }}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox value="allowExtraEmails" color="primary" />
                    }
                    label="Click here to indicate that you have read and agree to the terms presented in the Terms and Conditions agreement."
                  />
                </Grid>
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}>
                Sign Up
              </Button>
              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Link href="/login" variant="body2">
                    Already have an account? Sign in
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
