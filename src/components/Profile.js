import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';

import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import Input from '@mui/material/Input';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ImageIcon from '@mui/icons-material/Image';
import WorkIcon from '@mui/icons-material/Work';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import CategoryIcon from '@mui/icons-material/Category';
import MapIcon from '@mui/icons-material/Map';
import HomeIcon from '@mui/icons-material/Home';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import InboxIcon from '@mui/icons-material/Inbox';
import DraftsIcon from '@mui/icons-material/Drafts';
import CakeIcon from '@mui/icons-material/Cake';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import BadgeIcon from '@mui/icons-material/Badge';
import TrafficIcon from '@mui/icons-material/Traffic';
import Badge from '@mui/material/Badge';
import FormHelperText from '@mui/material/FormHelperText';
import CallIcon from '@mui/icons-material/Call';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';

import Fab from '@mui/material/Fab';
import LoadingButton from '@mui/lab/LoadingButton';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { styled } from '@mui/material/styles';

import { deepOrange, deepPurple, purple } from '@mui/material/colors';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import EditMissionComponent from '../components/EditMissionComponent';

import { TransitionProps } from '@mui/material/transitions';

import BorderedBoxWithLabel from './borderedBox';

import { parsePhoneNumber } from 'awesome-phonenumber';

import { UserContext } from '../UserContext';

import { shortDescriptionForSupervisor } from '../js/statusDescription';
import EditProfile from './EditProfile';

import {
  shortDescription,
  longDescription,
  setStatusStep,
} from '../js/statusDescription';
import AddressAutocomplete from './AddressAutocomplete';
import AutofillCheckoutDemo from './AddressAutocomplete2';
import SelectFormActivity from './SelectActivity';
import ImageDisplay from './ImageDisplay';
import StatusTimelineComponent from '../components/TimeLineStatus/StatusTimeline';
import RefreshButton from './refreshIcon';

// Extend dayjs with the necessary plugins

// Set locale to French
dayjs.locale('fr');

const fabStyle = {
  position: 'absolute',
  top: 16,
  right: 16,
};

// Stylred TextField
const options = {
  shouldForwardProp: (prop) => prop !== 'fontColor',
};
const StyledTextField = styled(
  TextField,
  options
)(({ fontColor }) => ({
  input: {
    color: fontColor,
  },
}));

const Transition = function (props) {
  return React.createElement(
    Slide,
    Object.assign({ direction: 'up', ref: props.ref }, props)
  );
};

const BASE_URL = process.env.REACT_APP_BASE_URL;

const ProfilePage = ({ status }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isRegistered, setIsRegistered] = useState(true);
  const [resp, setResp] = useState(null);
  const [invisible, setInvisible] = useState(false);
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email2, setEmail2] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [activity, setActivity] = useState('');
  const [streetSelected, setStreetSelected] = React.useState('');
  const [citySelected, setCitySelected] = React.useState('');
  const [zipcodeSelected, setZipcodeSelected] = React.useState('');
  const [countrySelected, setCountrySelected] = React.useState('');
  const [userStatus, setUserStatus] = useState('');
  const [open, setOpen] = React.useState(false);

  console.log('Status from props', status);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const { userSelected } = location.state;
  console.log('from location', location.state.userLogged);
  console.log('from props', userSelected);
  // const user = location.state.userLogged
  // const { user } =
  //   location.state.userLogged &&
  //   location.state.userLogged.user.id === userSelected.id
  //     ? location.state.userLogged.user
  //     : userSelected;

  let user = {};

  if (
    (location.state.userLogged &&
      userSelected &&
      location.state.userLogged.user.id === userSelected.id) ||
    !userSelected
  ) {
    user = location.state.userLogged.user;
  } else {
    user = userSelected;
  }

  // const { user } = selectedUser;
  // const formattedPhoneNumber = parsePhoneNumber(user.phone).number
  //   .international;

  console.log(user);

  const handleCancelRegistration = () => {
    axios
      .delete(`${BASE_URL}/delete-registration/${user.id}`)
      .then((response) => {
        setIsRegistered(false);
        // console.log(response.data);
        console.log('Registration cancelled successfully');
        toast.success(
          `${user.first_name}, vous êtes bien retiré de la mission et vos données ont été effacées`,
          {
            position: 'top-center',
          }
        );
        setResp(response.data.msg);
        setTimeout(() => {
          navigate('/');
        }, 2500);
      })
      .catch((error) => {
        console.error('Failed to cancel registration: ', error);
      });
  };
  const handleActivityBadgeVisibility = () => {
    setInvisible(invisible);
  };
  const handleAddressBadgeVisibility = () => {
    setInvisible(invisible);
  };
  useEffect(() => {
    if (user.activity !== null) handleActivityBadgeVisibility();
    if (user.street !== null) handleAddressBadgeVisibility();
  }, []);

  const handleEditClick = () => {
    setEditing(true);
  };

  const handleSaveClick = async () => {
    // Perform any necessary validation or data processing before saving
    try {
      const response = await axios.patch(
        `${BASE_URL}/update-user-profile/${user.id}`,
        {
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          email2: email2,
          birth_date: birthDate,
          activity: activity,
          street: streetSelected,
          city: citySelected,
          zipcode: zipcodeSelected,
          country: countrySelected,
        }
      );
      console.log(response.data.message);

      // Perform any desired actions after successful submission
    } catch (error) {
      console.error(error);
      // Handle any errors
    }
    setEditing(false);
  };

  const handleFirstNameChange = (event) => {
    const selectedValue = event.target.value;
    setFirstName(selectedValue);
  };

  const handleLastNameChange = (event) => {
    const selectedValue = event.target.value;
    setLastName(selectedValue);
  };

  const handlePhoneChange = (event) => {
    const selectedValue = event.target.value;
    setPhone(selectedValue);
  };
  const handleEmail2Change = (event) => {
    const selectedValue = event.target.value;
    setEmail2(selectedValue);
  };

  const handleActivityChange = (event) => {
    const selectedValue = event.target.value;
    setActivity(selectedValue);
  };

  const handleStreetChange = (event) => {
    const selectedValue = event.target.value;
    setStreetSelected(selectedValue);
  };

  const handleCityChange = (event) => {
    const selectedValue = event.target.value;
    setCitySelected(selectedValue);
  };
  const handleZipcodeChange = (event) => {
    const selectedValue = event.target.value;
    setZipcodeSelected(selectedValue);
  };

  const handleCountryChange = (event) => {
    const selectedValue = event.target.value;
    setCountrySelected(selectedValue);
  };

  const getUserById = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/user-by-id/${user.id}`);
      if (response.data) {
        const userData = response.data;

        setFirstName(userData.first_name);
        setLastName(userData.last_name);
        setPhone(userData.phone);
        setEmail2(userData.email2);
        setBirthDate(userData.birth_date);
        setActivity(userData.activity);
        setCitySelected(userData.city);
        setStreetSelected(userData.street);
        setZipcodeSelected(userData.zipcode);
        setCountrySelected(userData.country);
        setUserStatus(userData.status);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUserById();
  }, []);
  // console.log(activity);
  const fabEdit = {
    color: 'secondary',
    sx: fabStyle,
    icon: <EditIcon />,
    label: 'Edit',
  };
  const fabSave = {
    color: 'primary',
    sx: fabStyle,
    icon: <SaveIcon />,
    label: 'Save',
  };

  const actions = [
    {
      icon: <EditIcon />,
      name: 'Modifier',
      operation: 'edit',
    },
    { icon: <SaveIcon />, name: 'Sauvegarder', operation: 'save' },
  ];

  //handler function
  const handleClick = (operation) => {
    if (operation === 'edit') {
      console.log('Edit mode');
      setEditing(true);
    } else if (operation === 'save') {
      // setEditing(false);
      console.log('Save mode');
      handleSaveClick();
    }
  };
  console.log(setStatusStep(status));

  return (
    <>
      {!isRegistered && (
        <Stack sx={{ width: '100%' }} spacing={2}>
          <Alert onClose={() => {}}>
            This is a success alert — check it out!
          </Alert>
          <Alert
            action={
              <Button color="inherit" size="small">
                UNDO
              </Button>
            }>
            This is a success alert — check it out!
          </Alert>
        </Stack>
      )}
      <Box></Box>
      <ToastContainer />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={12} md={6} lg={4}>
          <BorderedBoxWithLabel
            label="Vos données personnelles"
            sx={{ display: 'flex' }}>
            {user.mission ? (
              <List
                sx={{
                  width: '100%',

                  bgcolor: 'background.paper',
                }}>
                {/* <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <CategoryIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.mission.title}
                    secondary={user.mission.description}
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <MapIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={user.mission.location} secondary="" />
                </ListItem> */}
                {/* {editing ? (
                  <label>
                    <Fab
                      sx={fabSave.sx}
                      aria-label={fabSave.label}
                      color={fabSave.color}
                      onClick={() => handleSaveClick()}
                      component="button">
                      {fabSave.icon}
                    </Fab>
                  </label>
                ) : (
                  <label>
                    <Fab
                      sx={fabEdit.sx}
                      aria-label={fabEdit.label}
                      color={fabEdit.color}
                      onClick={() => handleEditClick()}
                      component="button">
                      {fabEdit.icon}
                    </Fab>
                  </label>
                )} */}

                <SpeedDial
                  // onClick={() => handleClick()}
                  direction={'down'}
                  ariaLabel="SpeedDial basic example"
                  sx={{ position: 'absolute', top: 16, right: 16 }}
                  icon={<SpeedDialIcon openIcon={<ManageAccountsIcon />} />}>
                  {actions.map((action) => (
                    <SpeedDialAction
                      key={action.name}
                      icon={action.icon}
                      tooltipTitle={action.name}
                      operation={action.operation}
                      onClick={() => handleClick(action.operation)}
                    />
                  ))}
                </SpeedDial>

                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <PermIdentityIcon />
                    </Avatar>
                  </ListItemAvatar>
                  {/* <ListItemText
                    primary={`${user.first_name} ${user.last_name}`}
                  /> */}
                  <Stack spacing={2} direction="row">
                    <TextField
                      label="Prénom"
                      value={firstName}
                      onChange={handleFirstNameChange}
                      disabled={!editing}
                      variant="standard"
                      color="warning"
                      focused
                    />
                    <TextField
                      label="Nom"
                      value={lastName}
                      onChange={handleLastNameChange}
                      disabled={!editing}
                      variant="standard"
                      color="warning"
                      focused
                    />
                  </Stack>
                </ListItem>

                {/* <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <ContactMailIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    sx={{ color: 'grey' }}
                    primary={user.email}
                    secondary="Nom d'utilisateur"
                  />
                </ListItem> */}
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <ContactMailIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <FormControl sx={{ width: '50%' }}>
                    <TextField
                      label="Nom d'utilsateur"
                      value={user.email}
                      disabled
                      variant="standard"
                      focused
                    />
                  </FormControl>
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <CallIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <FormControl sx={{ width: '50%' }}>
                    <TextField
                      label="Téléphone"
                      value={
                        phone && parsePhoneNumber(phone).number.international
                      }
                      onChange={handlePhoneChange}
                      disabled={!editing}
                      variant="standard"
                      color="warning"
                      focused
                    />
                  </FormControl>
                </ListItem>

                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <AlternateEmailIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <FormControl sx={{ width: '60%' }}>
                    <TextField
                      labelId="email2"
                      label="Email"
                      value={email2}
                      onChange={handleEmail2Change}
                      disabled={!editing}
                      variant="standard"
                      color="warning"
                      focused
                      InputLabelProps={{
                        shrink: true,
                      }}
                      placeholder="Email à privilégier pour les échanges"
                    />
                    {/* <FormHelperText sx={{ marginLeft: 0 }}>
                      Email à privilégier pour les échanges
                    </FormHelperText> */}
                  </FormControl>
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <CakeIcon />
                    </Avatar>
                  </ListItemAvatar>
                  {/* <FormControl sx={{ width: '50%' }}>
                    <TextField
                      label="Date de naissance"
                      value={user.birthDate}
                      onChange={handleBirthDateChange}
                      variant="standard"
                      focused
                      disabled={!editing}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </FormControl> */}
                  <FormControl>
                    <LocalizationProvider
                      dateAdapter={AdapterDayjs}
                      adapterLocale="fr">
                      <DatePicker
                        value={dayjs(birthDate)}
                        onChange={(newValue) => setBirthDate(newValue)}
                        disabled={!editing}
                        variant="standard"
                        id="birthdate"
                        label="Date de naissance"
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </LocalizationProvider>
                  </FormControl>
                </ListItem>
                {/* <ListItem>
                  <ListItemAvatar>
                    <Badge
                      badgeContent=""
                      color="warning"
                      variant="dot"
                      invisible={invisible}>
                      <Avatar>
                        <WorkIcon />
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                   <SelectFormActivity
                    userId={user.id}
                    activivity={activity}
                    onHandleChangeActivity={handleActivityChange}
                    editing={editing}
                  /> 
                </ListItem>*/}
                <ListItem>
                  <ListItemAvatar>
                    <Badge
                      badgeContent=""
                      color="warning"
                      variant="dot"
                      invisible={user.activity !== null ? true : false}>
                      <Avatar>
                        <WorkIcon />
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <FormControl
                    variant="standard"
                    sx={{ m: 1 }}
                    fullWidth
                    required>
                    <InputLabel id="demo-simple-select-standard-label">
                      Activité
                    </InputLabel>
                    <Select
                      color="warning"
                      disabled={!editing}
                      labelId="demo-simple-select-standard-label"
                      id="demo-simple-select-standard"
                      value={activity || ''}
                      onChange={handleActivityChange}
                      label="Activité">
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      <MenuItem value={'Indépendant(e)'}>
                        Indépendant(e)
                      </MenuItem>
                      <MenuItem value={'Salarié(e)'}>Salarié(e)</MenuItem>
                      <MenuItem value={'Etudiant(e)'}>Etudiant(e)</MenuItem>
                      <MenuItem value={'Lycéen(ne)'}>Lycéen(ne)</MenuItem>
                      <MenuItem value={'Retraité(e)'}>Retraité(e)</MenuItem>
                      <MenuItem value={'Sans activité'}>Sans activité</MenuItem>
                    </Select>
                  </FormControl>
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Badge
                      badgeContent=""
                      color="warning"
                      variant="dot"
                      invisible={user.street !== null ? true : false}>
                      <Avatar>
                        <HomeIcon />
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <AddressAutocomplete
                    required
                    editing={editing}
                    userId={user.id}
                    street={streetSelected}
                    city={citySelected}
                    zipcode={zipcodeSelected}
                    country={countrySelected}
                    onStreetChange={handleStreetChange}
                    onCityChange={handleCityChange}
                    onZipcodeChange={handleZipcodeChange}
                    onCountryChange={handleCountryChange}
                  />
                </ListItem>
                {user.activity === null || user.street === null ? (
                  <ListItem>
                    <ListItemText
                      primary={
                        <Badge
                          badgeContent=""
                          color="warning"
                          variant="dot"></Badge>
                      }
                      secondary="Merci de renseigner ces données quand vous le souhaitez d'ici l'étape 4."
                    />
                  </ListItem>
                ) : (
                  ''
                )}
              </List>
            ) : (
              <p>Please log in to view your profile.</p>
            )}
          </BorderedBoxWithLabel>
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={4}>
          <BorderedBoxWithLabel label="La mission">
            {/* Content for Box 2 */}
            {location.state.userLogged.user.role === 'admin' ||
            (location.state.userLogged.user.role === 'volunteer' &&
              setStatusStep(status).slice(
                0,
                setStatusStep(status).indexOf('/')
              ) < 4) ? (
              <EditMissionComponent user={user} />
            ) : (
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <CategoryIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.mission.title}
                    secondary={user.mission.description}
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <MapIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={user.mission.location} secondary="" />
                </ListItem>
              </List>
            )}
          </BorderedBoxWithLabel>
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={4}>
          <BorderedBoxWithLabel label="Votre statut">
            {/* Content for Box 3 */}

            {/* <ImageDisplay /> */}
            <Box display="flex" flexDirection="column">
              <Box>
                <List>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'secondary.main' }}>
                        {setStatusStep(status)}
                      </Avatar>
                    </ListItemAvatar>

                    <ListItemText primary={shortDescription(status)} />
                    {/* <RefreshButton getUser={getUserById} /> */}
                  </ListItem>
                  {/* <ListItem>
                <ListItemText
                  sx={{ ml: 2 }}
                  secondary={shortDescriptionForSupervisor(user.status)}
                />
              </ListItem> */}
                </List>
              </Box>
            </Box>
            <StatusTimelineComponent userStatusStep={setStatusStep(status)} />
          </BorderedBoxWithLabel>
        </Grid>
      </Grid>

      <Box>
        <Typography variant="body2">
          Votre compte est créé, vous avez encore la possibilité d'annuler votre
          candidature.
        </Typography>
        <Button
          type="submit"
          onClick={handleClickOpen}
          variant="contained"
          sx={{ backgroundColor: 'primary', mt: 3, mb: 2 }}>
          Retirer ma candidature
        </Button>
        <Dialog
          open={open}
          TransitionComponent={Transition}
          keepMounted
          onClose={handleClose}
          aria-describedby="alert-dialog-slide-description">
          <DialogTitle>{'Retirer ma candidature ?'}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              Je confirme vouloir annuler ma candidature pour la mission
              proposée par l'Association Séphora Berrebi.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Annuler</Button>
            <Button onClick={handleCancelRegistration}>Confirmer</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default ProfilePage;
