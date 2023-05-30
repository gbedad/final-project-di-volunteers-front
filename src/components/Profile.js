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

import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import BadgeIcon from '@mui/icons-material/Badge';
import TrafficIcon from '@mui/icons-material/Traffic';
import Badge from '@mui/material/Badge';

import BorderedBoxWithLabel from './borderedBox';

import { parsePhoneNumber } from 'awesome-phonenumber';

import { UserContext } from '../UserContext';

import { shortDescriptionForSupervisor } from '../js/statusDescription';

import {
  shortDescription,
  longDescription,
  setStatusStep,
} from '../js/statusDescription';
import AddressAutocomplete from './AddressAutocomplete';
import AutofillCheckoutDemo from './AddressAutocomplete2';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const ProfilePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isRegistered, setIsRegistered] = useState(true);
  const [resp, setResp] = useState(null);

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
        <Grid item xs={12} sm={4}>
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
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <BadgeIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${user.first_name} ${user.last_name}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <AlternateEmailIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.email}
                    secondary={formattedPhoneNumber}
                  />
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
                    <Badge badgeContent="" color="warning" variant="dot">
                      <Avatar>
                        <WorkIcon />
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                    <InputLabel id="demo-simple-select-standard-label">
                      Activité
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-standard-label"
                      id="demo-simple-select-standard"
                      value={activity}
                      // onChange={handleChange}
                      label="Activité">
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      <MenuItem value={'independant'}>Indépendant(e)</MenuItem>
                      <MenuItem value={'etudiant'}>Etudiant(e)</MenuItem>
                      <MenuItem value={'retraite'}>Retraité(e)</MenuItem>
                      <MenuItem value={'sans'}>Sans activité</MenuItem>
                    </Select>
                  </FormControl>

                  {/* <ListItemText primary="Salarié" /> */}
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Badge badgeContent="" color="warning" variant="dot">
                      <Avatar>
                        <HomeIcon />
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <AddressAutocomplete />
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
        <Grid item xs={12} sm={4}>
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
        <Grid item xs={12} sm={4}>
          <BorderedBoxWithLabel label="Votre statut">
            {/* Content for Box 3 */}
            <List>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <Badge
                      color="grey"
                      badgeContent={setStatusStep(user.status)}></Badge>
                  </Avatar>
                </ListItemAvatar>

                <ListItemText primary={shortDescription(user.status)} />
              </ListItem>
              <ListItem>
                <ListItemText
                  sx={{ ml: 2 }}
                  secondary={shortDescriptionForSupervisor(user.status)}
                />
              </ListItem>
            </List>
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
