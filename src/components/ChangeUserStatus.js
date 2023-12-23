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
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';

import Person2Icon from '@mui/icons-material/Person2';
import Grid from '@mui/material/Grid';

import Stack from '@mui/material/Stack';

import CakeIcon from '@mui/icons-material/Cake';

import LinearProgress from '@mui/material/LinearProgress';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

import Popper from '@mui/material/Popper';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';

import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import { lightBlue } from '@mui/material/colors';

import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';

import { longDescription, nextStepStatus } from '../js/statusDescription';

import FileDisplay from './FileDisplay';
import DocumentCheckbox from './files/filesSaved';
import BorderedBoxWithLabel from './borderedBox';
import { parsePhoneNumber } from 'awesome-phonenumber';
import FormInterviewComponent from './interviews/Interview';

import TopicGradeComponent from '../components/TopicGrade';
import PreInterviewComponent from './interviews/PreInterview';

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
  const [anchorEl, setAnchorEl] = React.useState(null);
  // const [openPopper, setOpenPopper] = React.useState(false);
  // const [placement, setPlacement] = React.useState();

  const handleClick = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const openPopper = Boolean(anchorEl);

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
        localStorage.setItem('user-status', response.data.status);
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
    // <ThemeProvider theme={lightTheme}>
    <>
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
          <Button variant="contained" onClick={handleSubmitActiveChange}>
            CONFIRMER
          </Button>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6} lg={3}>
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
                      style={{
                        maxWidth: 300, // Set your desired max width
                        maxHeight: 150,
                        overflowY: 'auto',
                        msOverflowStyle: 'none', // or 'hidden' for truncation
                        whiteSpace: 'normal', // or 'nowrap' for truncation,
                        scrollbarWidth: 'thin', // Firefox
                        scrollbarColor: 'darkgray lightgray', // Firefox
                        WebkitOverflowScrolling: 'touch', // iOS momentum scrolling
                        '&::-webkit-scrollbar': {
                          width: '12px', // Width of vertical scrollbar
                        },
                        '&::-webkit-scrollbar-thumb': {
                          backgroundColor: 'darkgray', // Color of the thumb
                          borderRadius: '6px', // Rounded corners
                        },
                        '&::-webkit-scrollbar-track': {
                          backgroundColor: 'lightgray', // Color of the track
                        },
                      }}
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

                <ListItemButton onClick={handleClick}>
                  <ListItemAvatar>
                    <Avatar>
                      <TextSnippetIcon />
                    </Avatar>
                  </ListItemAvatar>

                  <Box
                    style={{
                      maxWidth: 600, // Set your desired max width
                      maxHeight: 150,
                      overflowY: 'hidden',
                      msOverflowStyle: 'none', // or 'hidden' for truncation
                      whiteSpace: 'normal', // or 'nowrap' for truncation,
                    }}>
                    <Popper
                      open={openPopper}
                      anchorEl={anchorEl}
                      placement="top-start"
                      transition
                      keepMounted={true}>
                      {({ TransitionProps }) => (
                        <Fade {...TransitionProps} timeout={950}>
                          <Paper
                            elevation={3}
                            sx={{
                              p: 2,
                              minWidth: 420,
                              maxWidth: 600,
                              backgroundColor: '#d6f6f6',
                              color: 'primary.main',
                            }}>
                            <Typography variant="h6" component="div">
                              Motivation
                            </Typography>
                            <Typography
                              sx={{ fontStyle: 'italic' }}
                              variant="body1"
                              component="div">
                              <ListItemText primary={user.message} />
                            </Typography>
                          </Paper>
                        </Fade>
                      )}
                    </Popper>
                    <Typography>
                      Cliquer ici pour voir le texte de motivation
                    </Typography>
                    {/* <Button onClick={handleClick('top-start')}>top-end</Button> */}
                  </Box>
                </ListItemButton>
              </List>
              <div>
                <Box sx={{ minWidth: 120 }}>
                  <FormControl variant="standard" sx={{ m: 1, minWidth: 300 }}>
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
                      <MenuItem value={'Compte créé'}>
                        <CustomWidthTooltip
                          placement="right"
                          title={
                            <Typography
                              sx={{ fontSize: '16px', padding: '5px' }}>
                              {longDescription('Compte créé')}
                            </Typography>
                          }
                          arrow>
                          <span>Compte créé</span>
                        </CustomWidthTooltip>
                      </MenuItem>
                      <MenuItem value={'A renseigner'}>
                        <CustomWidthTooltip
                          placement="right"
                          title={
                            <Typography
                              sx={{ fontSize: '16px', padding: '5px' }}>
                              {longDescription('A renseigner')}
                            </Typography>
                          }
                          arrow>
                          <span>A renseigner</span>
                        </CustomWidthTooltip>
                      </MenuItem>
                      <MenuItem value={'A interviewer'}>
                        <CustomWidthTooltip
                          placement="right"
                          title={
                            <Typography
                              sx={{ fontSize: '16px', padding: '5px' }}>
                              {longDescription('A interviewer')}
                            </Typography>
                          }
                          arrow>
                          <span>A interviewer</span>
                        </CustomWidthTooltip>
                      </MenuItem>
                      <MenuItem value={'A finaliser'}>
                        <CustomWidthTooltip
                          placement="right"
                          title={
                            <Typography
                              sx={{ fontSize: '16px', padding: '5px' }}>
                              {longDescription('A finaliser')}
                            </Typography>
                          }
                          arrow>
                          <span>A finaliser</span>
                        </CustomWidthTooltip>
                      </MenuItem>
                      <MenuItem value={'Validé'}>
                        <CustomWidthTooltip
                          placement="right"
                          title={
                            <Typography
                              sx={{ fontSize: '16px', padding: '5px' }}>
                              {longDescription('Validé')}
                            </Typography>
                          }
                          arrow>
                          <span>Validé</span>
                        </CustomWidthTooltip>
                      </MenuItem>
                      <MenuItem value={'Déclinée'}>
                        <CustomWidthTooltip
                          placement="right"
                          title={
                            <Typography
                              sx={{ fontSize: '16px', padding: '5px' }}>
                              {longDescription('Déclinée')}
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
                <Button variant="contained" onClick={handleConfirmClick}>
                  Confirmer
                </Button>
              </div>
            </BorderedBoxWithLabel>
          </Grid>
          <Grid item xs={12} md={4} lg={3}>
            <BorderedBoxWithLabel label="Quoi & quand" sx={{ display: 'flex' }}>
              {user.skill ? (
                <>
                  <Box mt={3}>
                    <Typography variant="h6" component="div">
                      Matière(s)
                    </Typography>

                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                      {user.skill &&
                        user.skill.topics.map((topic, i) => (
                          <div key={i}>
                            {JSON.parse(topic).subject} de{' '}
                            {JSON.parse(topic).classStart} à{' '}
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
                        user.skill.when_day_slot &&
                        user.skill.when_day_slot.map((slot, i) => {
                          const parsedSlot = JSON.parse(slot);

                          // Check if parsedSlot is not null before accessing its properties
                          if (parsedSlot) {
                            return (
                              <div key={i}>
                                {parsedSlot.day} de {parsedSlot.startTime} à{' '}
                                {parsedSlot.endTime}
                              </div>
                            );
                          }

                          return null; // or handle the case when parsedSlot is null
                        })}
                    </Typography>
                  </Box>
                  <Box mt={2}>
                    <Typography variant="h6" component="div">
                      Lieu(x)
                    </Typography>
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                      {user.skill &&
                        user.skill.where_location &&
                        user.skill.where_location.map((location, i) => (
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
            <TopicGradeComponent userSelected={user.id} />
            <BorderedBoxWithLabel
              label="Premier contact"
              sx={{ display: 'flex' }}>
              <PreInterviewComponent />
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
                            sx={{
                              maxWidth: '360px', // Set your desired maximum width
                              width: '100%', // Ensure the width takes up the available space
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
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
    </>
  );
};

export default ChangeUserStatus;
