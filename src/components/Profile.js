import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

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

import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';

import Fab from '@mui/material/Fab';
import LoadingButton from '@mui/lab/LoadingButton';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

import { deepOrange, deepPurple, purple } from '@mui/material/colors';

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

const fabStyle = {
  position: 'absolute',
  top: 16,
  right: 16,
};

const BASE_URL = process.env.REACT_APP_BASE_URL;

const ProfilePage = () => {
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

  const [activity, setActivity] = useState('');

  console.log('from location', location.state.userLogged);
  // const user = location.state.userLogged
  const { user } = location.state.userLogged;
  const formattedPhoneNumber = parsePhoneNumber(user.phone).number
    .international;

  const handleCancelRegistration = () => {
    axios
      .delete(`${BASE_URL}/delete-registration/${user.id}`)
      .then((response) => {
        setIsRegistered(false);
        // console.log(response.data);
        console.log('Registration cancelled successfully');
        setResp(response.data.msg);
        navigate('/cancel-registration', {
          state: { message: 'You cancelled your Registration.', user },
        });
      })
      .catch((error) => {
        console.error('Failed to cancel registration: ', error);
      });
  };
  const handleActivityBadgeVisibility = () => {
    setInvisible(!invisible);
  };
  const handleAddressBadgeVisibility = () => {
    setInvisible(!invisible);
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

  const getUserById = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/user-by-id/${user.id}`);
      if (response.data) {
        const userData = response.data;
        setFirstName(userData.first_name);
        setLastName(userData.last_name);
        setPhone(userData.phone);
        setEmail2(userData.email2);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUserById();
  }, []);
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

                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <ContactMailIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.email}
                    secondary="Nom d'utilisateur"
                  />
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
                      value={parsePhoneNumber(phone).number.international}
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
                  <FormControl sx={{ width: '50%' }}>
                    <TextField
                      label="Email"
                      value={email2}
                      onChange={handleEmail2Change}
                      disabled={!editing}
                      variant="standard"
                      color="warning"
                      focused
                    />
                    <FormHelperText>
                      Email de correspondance si différente du nom d'utilsateur
                    </FormHelperText>
                  </FormControl>
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <CakeIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={user.birth_date} secondary="" />
                </ListItem>

                <ListItem>
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
                    activity={user.activity}
                    userId={user.id}
                  />

                  {/* <ListItemText primary="Salarié" /> */}
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Badge
                      badgeContent=""
                      color="warning"
                      variant="dot"
                      invisible={invisible}>
                      <Avatar>
                        <HomeIcon />
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <AddressAutocomplete
                    userId={user.id}
                    street={user.street}
                    city={user.city}
                    zipcode={user.zipcode}
                    country={user.country}
                  />
                </ListItem>
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
              </List>
            ) : (
              <p>Please log in to view your profile.</p>
            )}
          </BorderedBoxWithLabel>
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={4}>
          <BorderedBoxWithLabel label="La mission">
            {/* Content for Box 2 */}
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
          </BorderedBoxWithLabel>
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={4}>
          <BorderedBoxWithLabel label="Votre statut">
            {/* Content for Box 3 */}
            <List>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: purple[300] }}>
                    {setStatusStep(user.status)}
                  </Avatar>
                </ListItemAvatar>

                <ListItemText primary={shortDescription(user.status)} />
              </ListItem>
              {/* <ListItem>
                <ListItemText
                  sx={{ ml: 2 }}
                  secondary={shortDescriptionForSupervisor(user.status)}
                />
              </ListItem> */}
            </List>
            <ImageDisplay />
          </BorderedBoxWithLabel>
        </Grid>
      </Grid>
      <Button
        type="submit"
        onClick={handleCancelRegistration}
        fullWidth
        disabled={user.skill ? 'true' : 'false'}
        variant="contained"
        sx={{ backgroundColor: 'red', mt: 3, mb: 2 }}>
        Cancel registration
      </Button>
    </>
  );
};

export default ProfilePage;
