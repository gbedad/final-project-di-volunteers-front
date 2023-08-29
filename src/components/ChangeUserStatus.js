import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ImageIcon from '@mui/icons-material/Image';
import WorkIcon from '@mui/icons-material/Work';
import HomeIcon from '@mui/icons-material/Home';
import CategoryIcon from '@mui/icons-material/Category';
import MapIcon from '@mui/icons-material/Map';
import Typography from '@mui/material/Typography';

import Divider from '@mui/material/Divider';

import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DraftsIcon from '@mui/icons-material/Drafts';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';

import Person2Icon from '@mui/icons-material/Person2';
import Grid from '@mui/material/Grid';

import Stack from '@mui/material/Stack';

import CakeIcon from '@mui/icons-material/Cake';

import LinearProgress from '@mui/material/LinearProgress';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import { lightBlue } from '@mui/material/colors';

import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';

import { longDescription, nextStepStatus } from '../js/statusDescription';

import FileDisplay from './FileDisplay';
import DocumentCheckbox from './files/filesSaved';
import BorderedBoxWithLabel from './borderedBox';
import { parsePhoneNumber } from 'awesome-phonenumber';
import FormInterviewComponent from './interviews/Interview';

const BASE_URL = process.env.REACT_APP_BASE_URL;

// const Item = styled(Paper)(({ theme }) => ({
//   ...theme.typography.body2,
//   textAlign: 'center',
//   color: theme.palette.text.secondary,
//   height: 60,
//   lineHeight: '60px',
// }));

// const darkTheme = createTheme({ palette: { mode: 'dark' } });
const lightTheme = createTheme({ palette: { mode: 'light' } });

const CustomWidthTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 500,
  },
});

const ChangeUserStatus = () => {
  const { state } = useLocation();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [checked, setChecked] = React.useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [open, setOpen] = useState(false);
  // const [newIsActive, setNewIsActive] = useState(false)

  const handleActiveChange = async (event) => {
    console.log('Checked state', event.target.checked);
    setChecked(event.target.checked);
  };
  // if (checked === true) {
  //   setNewIsActive(true)
  // }
  // else {
  //   setNewIsActive(false)
  // }
  const handleSubmitActiveChange = async () => {
    try {
      await axios.patch(`${BASE_URL}/update-active-user/${state.userId}`, {
        newIsActive: checked,
      });
    } catch (err) {
      console.log(err);
    }
  };

  // console.log(state);
  // let userLogged = state.userLogged;

  const checkFileType = (mime) => {
    switch (mime) {
      case 'image/png':
        return <ImageIcon />;
      case 'image/jpeg':
        return <ImageIcon />;
      case 'application/pdf':
        return <PictureAsPdfIcon />;
      default:
        break;
    }
  };
  // console.log("userId", state.userId);

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/user-by-id/${state.userId}`
        );
        // console.log(response.data);
        setUser(response.data);
        setStatus(response.data.status);
        setChecked(response.data.is_active);
        // setNewIsActive(response.data.is_active)
      } catch (err) {
        console.log(err);
      }
    };
    getUser();
  }, [status]);

  const handleStatusChange = async (e) => {
    setNewStatus(e.target.value);
  };

  // console.log("USER", JSON.parse(user.skill.when_day_slot[0]).day)

  // console.log("new status:", newStatus);
  const handleConfirmClick = async () => {
    try {
      const response = await axios.patch(
        `${BASE_URL}/update-status/${user.id}`,
        { newStatus: newStatus }
      );
      setStatus(response.data.status);
    } catch (error) {
      console.error(error);
    }
  };
  const handleOpen = (file) => {
    setSelectedFile(file);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return !user ? (
    <Stack sx={{ color: 'grey.500' }} spacing={2} direction="row">
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    </Stack>
  ) : (
    <ThemeProvider theme={lightTheme}>
      <Container maxWidth="l">
        <Box mb={2}>
          <h3>Activer/désactiver</h3>
          <FormControlLabel
            control={
              <Switch
                checked={checked}
                onChange={handleActiveChange}
                inputProps={{ 'aria-label': 'controlled' }}
              />
            }
            label="Actif"
          />
          <Button onClick={handleSubmitActiveChange}>CONFIRMER</Button>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4} lg={3}>
            <BorderedBoxWithLabel label="Profil" sx={{ display: 'flex' }}>
              {user.mission ? (
                <List
                  sx={{
                    width: '100%',
                    maxWidth: 360,
                    bgcolor: 'background.paper',
                  }}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <Person2Icon />
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
                      primary={user.email2 ? user.email2 : user.email}
                      secondary={
                        parsePhoneNumber(user.phone).number.international
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <WorkIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={user.activity} secondary="" />
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
                      <Avatar>
                        <HomeIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        user.zipcode && user.city
                          ? `${user.zipcode} ${user.city}`
                          : ''
                      }
                      secondary={user.street}
                    />
                  </ListItem>
                </List>
              ) : (
                <li></li>
              )}

              <List component="nav" aria-label="main mailbox folders">
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
                      <FormatListNumberedIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.status}
                    secondary={nextStepStatus(user.status)}
                  />
                </ListItem>
                <ListItemButton>
                  <ListItemAvatar>
                    <Avatar>
                      <DraftsIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={user.message} />
                </ListItemButton>
              </List>
              <div>
                <Box sx={{ minWidth: 120 }}>
                  <FormControl variant="standard" sx={{ m: 1, width: 300 }}>
                    <InputLabel id="demo-simple-select-label">
                      Changer le statut
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={newStatus}
                      defaultValue={status}
                      label="Change Status"
                      onChange={handleStatusChange}>
                      <MenuItem value={'compte créé'}>
                        <CustomWidthTooltip
                          placement="right"
                          title={
                            <Typography
                              sx={{ fontSize: '16px', padding: '5px' }}>
                              {longDescription('compte créé')}
                            </Typography>
                          }
                          arrow>
                          <span>Compte créé</span>
                        </CustomWidthTooltip>
                      </MenuItem>
                      <MenuItem value={'à renseigner'}>
                        <CustomWidthTooltip
                          placement="right"
                          title={
                            <Typography
                              sx={{ fontSize: '16px', padding: '5px' }}>
                              {longDescription('à renseigner')}
                            </Typography>
                          }
                          arrow>
                          <span>A renseigner</span>
                        </CustomWidthTooltip>
                      </MenuItem>
                      <MenuItem value={'à interviewer'}>
                        <CustomWidthTooltip
                          placement="right"
                          title={
                            <Typography
                              sx={{ fontSize: '16px', padding: '5px' }}>
                              {longDescription('à interviewer')}
                            </Typography>
                          }
                          arrow>
                          <span>A interviewer</span>
                        </CustomWidthTooltip>
                      </MenuItem>
                      <MenuItem value={'à finaliser'}>
                        <CustomWidthTooltip
                          placement="right"
                          title={
                            <Typography
                              sx={{ fontSize: '16px', padding: '5px' }}>
                              {longDescription('à finaliser')}
                            </Typography>
                          }
                          arrow>
                          <span>A finaliser</span>
                        </CustomWidthTooltip>
                      </MenuItem>
                      <MenuItem value={'validé'}>
                        <CustomWidthTooltip
                          placement="right"
                          title={
                            <Typography
                              sx={{ fontSize: '16px', padding: '5px' }}>
                              {longDescription('validé')}
                            </Typography>
                          }
                          arrow>
                          <span>Validé</span>
                        </CustomWidthTooltip>
                      </MenuItem>
                      <MenuItem value={'déclinée'}>
                        <CustomWidthTooltip
                          placement="right"
                          title={
                            <Typography
                              sx={{ fontSize: '16px', padding: '5px' }}>
                              {longDescription('déclinée')}
                            </Typography>
                          }
                          arrow>
                          <span>Déclinée</span>
                        </CustomWidthTooltip>
                      </MenuItem>
                      {/* <MenuItem value={'validé'}>Validé</MenuItem>
                    <MenuItem value={'created'}>Created</MenuItem>
                    <MenuItem value={'proposed'}>Proposed</MenuItem>
                    <MenuItem value={'selected'}>Selected</MenuItem> */}
                    </Select>
                  </FormControl>
                </Box>
                <Button onClick={handleConfirmClick}>Confirmer</Button>
              </div>
            </BorderedBoxWithLabel>
          </Grid>
          <Grid item xs={12} md={4} lg={3}>
            <BorderedBoxWithLabel label="Quoi & quand" sx={{ display: 'flex' }}>
              {user.skill ? (
                <>
                  <Box mt={3}>
                    <Typography variant="h6" component="div">
                      Matières
                    </Typography>

                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                      {user.skill &&
                        user.skill.topics.map((topic, i) => (
                          <div key={i}>
                            {JSON.parse(topic).subject} from{' '}
                            {JSON.parse(topic).classStart} to{' '}
                            {JSON.parse(topic).classEnd}
                          </div>
                        ))}
                    </Typography>
                  </Box>
                  <Box mt={2}>
                    <Typography variant="h6" gutterBottom component="div">
                      Disponibilités
                    </Typography>

                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                      {user.skill &&
                        user.skill.when_day_slot.map((slot, i) => (
                          <div key={i}>
                            {JSON.parse(slot).day} from{' '}
                            {JSON.parse(slot).startTime} to{' '}
                            {JSON.parse(slot).endTime}
                          </div>
                        ))}
                    </Typography>
                  </Box>
                  <Box mt={2}>
                    <Typography variant="h6" component="div">
                      Où je peux aider
                    </Typography>
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                      {user.skill.where_location.map((location, i) => (
                        <div key={i}>{location}</div>
                      ))}
                    </Typography>
                  </Box>

                  <Card></Card>
                  <Card></Card>
                </>
              ) : (
                <Typography
                  component="div"
                  variant="p"
                  color="grey"
                  sx={{ minWidth: 275, mt: 2 }}>
                  Aucune information n'a été saisie.
                </Typography>
              )}
            </BorderedBoxWithLabel>
          </Grid>

          <Grid item xs={12} md={4} lg={3}>
            <BorderedBoxWithLabel label="Entretiens" sx={{ display: 'flex' }}>
              <FormInterviewComponent userId={user.id} />
              {/* <Typography mt={6} mb={2} color="info" variant="p" fontSize={14}>
                *Test voltaire ou autre test.
              </Typography>
              <Divider />
              {user.file.length !== 0 ? (
                <Box>
                  {user.file.map((f, i) => (
                    <List
                      key={i}
                      sx={{
                        width: '100%',
                        maxWidth: 360,
                        overflow: '',
                        maxHeight: 300,
                        position: 'relative',
                        bgcolor: 'background.paper',
                      }}>
                      <ListItem>
                        <ListItemButton
                          component="a"
                          onClick={() => handleOpen(f.path)}>
                          <ListItemAvatar>
                            <Avatar>{checkFileType(f.mimetype)}</Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={f.filename}
                            secondary={f.mimetype}
                          />
                        </ListItemButton>
                      </ListItem>
                    </List>
                  ))}
                </Box>
              ) : (
                <Typography component="div" sx={{ minWidth: 275, mt: 2 }}>
                  Aucun fichier n'a été téléchargé.
                </Typography>
              )} */}
            </BorderedBoxWithLabel>
          </Grid>
          <Grid item xs={12} md={4} lg={3}>
            <BorderedBoxWithLabel label="Documents" sx={{ display: 'flex' }}>
              <DocumentCheckbox user={user} />
              <Typography mt={6} mb={2} color="info" variant="p" fontSize={14}>
                *Test Voltaire ou autre.
              </Typography>
              <Divider />
              {user.file.length !== 0 ? (
                <Box>
                  {user.file.map((f, i) => (
                    <List
                      key={i}
                      sx={{
                        width: '100%',
                        maxWidth: 360,
                        overflow: '',
                        maxHeight: 300,
                        position: 'relative',
                        bgcolor: 'background.paper',
                      }}>
                      <ListItem>
                        <ListItemButton
                          component="a"
                          onClick={() => handleOpen(f.path)}>
                          <ListItemAvatar>
                            <Avatar>{checkFileType(f.mimetype)}</Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={f.filename}
                            secondary={f.mimetype}
                          />
                        </ListItemButton>
                      </ListItem>
                    </List>
                  ))}
                </Box>
              ) : (
                <Typography component="div" sx={{ minWidth: 275, mt: 2 }}>
                  Aucun fichier n'a été téléchargé.
                </Typography>
              )}
            </BorderedBoxWithLabel>
          </Grid>
        </Grid>
        {selectedFile && (
          <FileDisplay
            s3FilePath={selectedFile}
            open={open}
            handleClose={handleClose}
          />
        )}
      </Container>
    </ThemeProvider>
  );
};

export default ChangeUserStatus;
