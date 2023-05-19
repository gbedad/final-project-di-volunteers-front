import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { Card, CardContent, Typography } from '@mui/material';
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
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import InboxIcon from '@mui/icons-material/Inbox';
import DraftsIcon from '@mui/icons-material/Drafts';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import BadgeIcon from '@mui/icons-material/Badge';
import TrafficIcon from '@mui/icons-material/Traffic';

import { UserContext } from '../UserContext';

import { shortDescription, longDescription } from '../js/statusDescription';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const ProfilePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isRegistered, setIsRegistered] = useState(true);
  const [resp, setResp] = useState(null);

  console.log('from location', location.state.userLogged);
  // const user = location.state.userLogged
  const { user } = location.state.userLogged;
  console.log(user);

  const handleCancelRegistration = () => {
    axios
      .delete(`${BASE_URL}/delete-registration/${user.id}`)
      .then((response) => {
        setIsRegistered(false);
        console.log(response.data);
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
      <Box sx={{ display: 'flex' }}>
        {user.mission ? (
          <List
            sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
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
            <ListItem>
              <ListItemAvatar>
                <Avatar>
                  <AlternateEmailIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={user.email} secondary={user.phone} />
            </ListItem>
            <ListItem>
              <ListItemAvatar>
                <Avatar>
                  <BadgeIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={user.last_name}
                secondary={user.first_name}
              />
            </ListItem>
            <ListItem>
              <ListItemAvatar>
                <Avatar>
                  <TrafficIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={shortDescription(user.status)}
                secondary="Your status will change when we have checked information."
              />
            </ListItem>
          </List>
        ) : (
          <p>Please log in to view your profile.</p>
        )}
      </Box>

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
