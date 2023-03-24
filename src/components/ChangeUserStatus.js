import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {useLocation} from 'react-router-dom';

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
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
import Typography from '@mui/material/Typography';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import InboxIcon from '@mui/icons-material/Inbox';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DraftsIcon from '@mui/icons-material/Drafts';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import BadgeIcon from '@mui/icons-material/Badge';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';

import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';

import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import { lightBlue } from '@mui/material/colors';


const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  textAlign: 'center',
  color: theme.palette.text.secondary,
  height: 60,
  lineHeight: '60px',
}));

const darkTheme = createTheme({ palette: { mode: 'dark' } });
const lightTheme = createTheme({ palette: { mode: 'light' } });


const ChangeUserStatus = () => {
    const {state} = useLocation()
    const [user, setUser] = useState(null)
    const [status, setStatus] = useState('');
    const [newStatus, setNewStatus] = useState('');

    console.log(state);
    let userLogged = state.userLogged

    const checkFileType = (mime) => {

      switch (mime) {
        case 'image/png':
          return <ImageIcon/>
          
        case 'application/pdf':
          return <PictureAsPdfIcon/>
        default:
          break;
      }
    }


    useEffect(() => {
      const getUser = async () => {
        try {
          const response = await axios.get(`/user-by-id/${state.userId}`)
          console.log(response.data);
          setUser(response.data)
          setStatus(response.data.status)
        }
        catch (err) {
          console.log(err)
        }
      }
      getUser()
    }, [status])

    const handleStatusChange = async (e) => {
      setNewStatus(e.target.value);
    }

    // console.log("USER", JSON.parse(user.skill.when_day_slot[0]).day)

    console.log("new status:", newStatus);
    const handleConfirmClick = async () => {
      try {
        const response = await axios.patch(`/update-status/${user.id}`, { newStatus: newStatus });
        setStatus(response.data.status);
      } catch (error) {
        console.error(error);
      }
    };


  return (
      !user ? (
    <Stack sx={{ color: 'grey.500' }} spacing={2} direction="row">
      <CircularProgress color="secondary" />
      <CircularProgress color="success" />
      <CircularProgress color="inherit" />
    </Stack>
      )
      :
      (
        <ThemeProvider theme={lightTheme}>
        <Container>
        <Grid container spacing={2}>
          <Grid item xs={5}>
          <h2>Change Status</h2>
          {user.mission ?
          <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <CategoryIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={user.mission.title} secondary={user.mission.description} />
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
                    <BadgeIcon/>
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={user.last_name} secondary={user.first_name} />
              </ListItem>
            </List>
            :
            <li></li>
            }
          <Box sx={{ width: '100%', maxWidth: 560, bgcolor: 'background.paper' }}>
            <List component="nav" aria-label="main mailbox folders">
              <ListItemButton
              >
                <ListItemIcon>
                  <DraftsIcon />
                </ListItemIcon>
                <ListItemText primary={user.message} />
              </ListItemButton>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <BadgeIcon/>
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={user.status} secondary="Define a new status if necessary" />
              </ListItem>
            </List>
            <Divider />
          </Box>
            
          <div>
              <Box sx={{ minWidth: 120 }}>
                <FormControl variant="standard"  sx={{ m: 1, width: 300 }}>
                  <InputLabel id="demo-simple-select-label">Change Status</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={newStatus}
                    defaultValue={status}
                    label="Change Status"
                    onChange={handleStatusChange}
                  >
                    <MenuItem value={"created"}>Created</MenuItem>

                    <MenuItem value={"proposed"}>Proposed</MenuItem>
                    <MenuItem value={"selected"}>Selected</MenuItem>
                    <MenuItem value={"validated"}>Validated</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Button
                onClick={handleConfirmClick}>
                Confirm Status
              </Button>
          </div>
          </Grid>
          <Grid item xs={4} sx={{ mt: 3 }}>
              <Typography  variant="h5" sx={{ minWidth: 275, mt: 6 }}>
                  Skills
              </Typography>
            {user.skill ?
          <>
              <Card sx={{ minWidth: 275, mt: 3, mb: 3 }}>
                <CardContent>
                  <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                    Fields of competences
                  </Typography>
                  <Typography variant="h6" component="div">
                  TOPICS
                  </Typography>
                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  {user.skill.topics.map((topic, i) =>  (
                  <div key={i}>{topic}</div>
                )
                )}
                  </Typography>
                </CardContent>
              </Card>
              <Card sx={{ minWidth: 275, mt: 3, mb: 3 }}>
                <CardContent>
                  <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                    Availabilities
                  </Typography>
                  <Typography variant="h6" component="div">
                  DAYS AND TIME SLOTS
                  </Typography>
                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  {user.skill && user.skill.when_day_slot.map((slot, i) =>  (
                  <div key={i}>
                    {JSON.parse(slot).day} from {JSON.parse(slot).startTime} to {JSON.parse(slot).endTime}
                  </div>
                )
                )}
                  </Typography>
                </CardContent>
              </Card>
              <Card sx={{ minWidth: 275, mt: 3, mb: 3 }}>
                <CardContent>
                  <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                    Where I can act
                  </Typography>
                  <Typography variant="h6" component="div">
                  LOCATION
                  </Typography>
                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  {user.skill.where_location.map((location, i) =>  (
                  <div key={i}>{location}</div>
                )
                )}
                  </Typography>
                </CardContent>
              </Card>

              <Card>
                
                </Card>
                <Card>
                
                </Card>
          </>
            :
            (
              <Typography  component="div" sx={{ minWidth: 275, mt: 2 }}>
                  No Skill have been inserted
              </Typography>
            )}
          </Grid>
          <Grid item xs={3} sx={{ mt: 3 }}>
          <Typography variant="h5" component="div" sx={{ minWidth: 275, mt: 6 }}>
                  Files Uploaded
          </Typography>
            {user.file.length !== 0 ? (
              <Card sx={{ minWidth: 275, mt:3 }}>
              <CardContent>
                {user.file.map((f, i) => (
                  <List key={i} sx={{ width: '100%', maxWidth: 360, overflow: '',
                  maxHeight: 300, position: 'relative',bgcolor: 'background.paper' }}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        {checkFileType(f.mimetype)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={f.filename} secondary={f.mimetype}/>
                  </ListItem>
                  </List>
                ))}
              </CardContent>
            </Card>
            ):
            <Typography  component="div" sx={{ minWidth: 275, mt: 2 }} >
                No file have been uploaded
            </Typography>
            }

          </Grid>
        </Grid>
        </Container>
        </ThemeProvider>
      )
  )
}

export default ChangeUserStatus