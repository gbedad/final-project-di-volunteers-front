import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
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
// import ImageIcon from '@mui/icons-material/Image';
import WorkIcon from '@mui/icons-material/Work';
import HomeIcon from '@mui/icons-material/Home';
import CategoryIcon from '@mui/icons-material/Category';
import MapIcon from '@mui/icons-material/Map';
import Typography from '@mui/material/Typography';


// import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
// import DraftsIcon from '@mui/icons-material/Drafts';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';

import Person2Icon from '@mui/icons-material/Person2';
import Grid from '@mui/material/Grid';

import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import MuiLink from '@mui/material/Link';

import CakeIcon from '@mui/icons-material/Cake';

import LinearProgress from '@mui/material/LinearProgress';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

import Popper from '@mui/material/Popper';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
// import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
// import { lightBlue } from '@mui/material/colors';

import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';

import { longDescription, nextStepStatus } from '../js/statusDescription';

import FileDisplay from './FileDisplay';
import DocumentCheckbox from './files/filesSaved';
import BorderedBoxWithLabel from './borderedBox';
import { parsePhoneNumber } from 'awesome-phonenumber';
import FormInterviewComponent from './interviews/Interview';

// import TopicGradeComponent from '../components/TopicGrade';
import PreInterviewComponent from './interviews/PreInterview';
import DiscussionThread from './interviews/DiscussionThread';
import WhatsAppButton from './WhatsAppButton';
import ConventionSteps from './application/ConventionSteps';
import SaveStatus from './application/SaveStatus';
import ArchiveDialog from './admin/ArchiveDialog';
import ArchiveIcon from '@mui/icons-material/Archive';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  AvailabilityChip,
  UnavailableControl,
} from './application/Availability';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import { notifyApplicationChanged } from '../js/applicationProgress';
import EmailButton from './EmailButton';
import { volunteerEmail } from '../js/email';
import toast from 'react-hot-toast';
import { isManager } from '../js/roles';

import DocumentSlots from './application/DocumentSlots';

import { existingStatuses } from '../options/existingOptions';
import CohortTransferList from './Cohorts';

// Statuses that send an email to the volunteer (asked for confirmation)
const EMAIL_STATUSES = ['A finaliser', 'Validé'];

const BASE_URL = process.env.REACT_APP_BASE_URL;

// const Item = styled(Paper)(({ theme }) => ({
//   ...theme.typography.body2,
//   textAlign: 'center',
//   color: theme.palette.text.secondary,
//   height: 60,
//   lineHeight: '60px',
// }));

// const darkTheme = createTheme({ palette: { mode: 'dark' } });
// const lightTheme = createTheme({ palette: { mode: 'light' } });

// Used by the commented-out status <Select> below
// eslint-disable-next-line no-unused-vars
const CustomWidthTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 500,
  },
});

const ChangeUserStatus = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [isActive, setIsActive] = React.useState(false);
  const [selectedFile] = useState(null);
  const [open, setOpen] = useState(false);
  const [statusSave, setStatusSave] = useState('idle');
  // Status waiting for the confirmation of the email it sends
  const [pendingStatus, setPendingStatus] = useState(null);
  const [archiving, setArchiving] = useState(false);
  const [archiveBlocked, setArchiveBlocked] = useState([]);
  // const [newIsActive, setNewIsActive] = useState(false)
  const [anchorEl, setAnchorEl] = React.useState(null);


  // const [openPopper, setOpenPopper] = React.useState(false);
  // const [placement, setPlacement] = React.useState();
  const userLogged = JSON.parse(localStorage.getItem('user'));
  const handleClick = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const openPopper = Boolean(anchorEl);

  const updateIsActive = async (event) => {
    // console.log('Checked state', event.target.checked);
    const newIsActive = event.target.checked;
    setIsActive(newIsActive);
    try {
      const response = await axios.patch(
        `${BASE_URL}/update-active-user/${state.userId}`,
        {
          isActive: newIsActive,
        }
      );
      if (response.status === 200) {
        console.log('Availability updated successfully:', response.data);
      } else {
        console.warn('Unexpected response status:', response.status);
      }
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error:', error.message);
      }
    }
  };
  // setShowActiveConfirm(true);

  // const handleSubmitActiveChange = async () => {
  //   try {
  //     await axios.patch(`${BASE_URL}/update-active-user/${state.userId}`, {
  //       newIsActive: checked,
  //     });
  //     setShowActiveConfirm(false);
  //     return true;
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

  // After a change of the tutor's availability
  const reloadUser = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/user-by-id/${user.id}`);
      setUser(data);
    } catch (err) {
      console.error(err);
    }
  };


  // console.log(userLogged, state);
  // const handleEditUserProfile = () => {
  //   navigate('../profile', {
  //     state: { userSelected: user, userLogged },
  //   });
  // };

  // console.log(state);
  // let userLogged = state.userLogged;

  // const checkFileType = (mime) => {
  //   switch (mime) {
  //     case 'image/png':
  //       return <ImageIcon />;
  //     case 'image/jpeg':
  //       return <ImageIcon />;
  //     case 'application/pdf':
  //       return <PictureAsPdfIcon />;
  //     default:
  //       break;
  //   }
  // };
  // console.log("userId", state.userId);
  // console.log(userLogged.user.first_name);

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/user-by-id/${state.userId}`
        );
        // console.log(response.data);
        setUser(response.data);
        setStatus(response.data.status);
        setIsActive(response.data.is_active);
        // setNewIsActive(response.data.is_active)
        localStorage.setItem('user-status', response.data.status);
      } catch (err) {
        console.log(err);
      }
    };
    getUser();
  }, [state.userId, status]);

  // Saved as soon as it is chosen, like the rest of the page; a status that
  // emails the volunteer is confirmed first
  const handleStatusChange = (e) => {
    const value = e.target.value;
    if (EMAIL_STATUSES.includes(value) && value !== status) {
      setPendingStatus(value);
    } else {
      saveStatus(value);
    }
  };

  const saveStatus = async (value) => {
    const previous = status;
    setNewStatus(value);
    setStatusSave('saving');
    try {
      const response = await axios.patch(
        `${BASE_URL}/update-status/${user.id}`,
        { newStatus: value }
      );
      setStatus(response.data.status);
      notifyApplicationChanged();
      setStatusSave('saved');
      toast.success(`Statut enregistré : ${response.data.status}`, {
        position: 'bottom-left',
      });
    } catch (error) {
      console.error(error);
      setNewStatus(previous);
      setStatusSave(error.sessionExpired ? 'expired' : 'error');
      toast.error("Le statut n'a pas pu être enregistré", {
        position: 'bottom-left',
      });
    }
  };
  // console.log(user);
  const handleEditUserProfile = () => {
    navigate('../stepper', {
      state: { userSelected: user, userLogged },
    });
  };

  const handleCancelRegistration = () => {
    axios
      .delete(`${BASE_URL}/delete-registration/${user.id}`)
      .then((response) => {
        // console.log(response.data);
        // console.log('Registration cancelled successfully');
        setTimeout(() => {
          navigate('/view-users', {
            state: { userSelected: user, userLogged },
          });
        }, 2500);
      })
      .catch((error) => {
        console.error('Failed to cancel registration: ', error);
      });
  };

  // console.log(user, userLogged);

  // console.log("USER", JSON.parse(user.skill.when_day_slot[0]).day)

  // console.log("new status:", newStatus);
  // Former volunteer: archived (no login, hidden day to day), or back
  const archive = async ({ reason, deleteSensitive }) => {
    try {
      await axios.post(`${BASE_URL}/admin/users/${user.id}/archive`, {
        reason,
        deleteSensitive,
      });
      setArchiving(false);
      setStatus('Archivé');
      toast.success('Bénévole archivé', { position: 'bottom-left' });
    } catch (err) {
      const data = err.response?.data;
      setArchiveBlocked([
        { id: user.id, error: data?.error || 'Archivage impossible', openPairs: data?.openPairs },
      ]);
    }
  };
  const unarchive = async () => {
    try {
      const { data } = await axios.post(
        `${BASE_URL}/admin/users/${user.id}/unarchive`
      );
      setStatus(data.status);
      setNewStatus(data.status);
      toast.success(`Bénévole désarchivé : ${data.status}`, {
        position: 'bottom-left',
      });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Désarchivage impossible', {
        position: 'bottom-left',
      });
    }
  };

  // From the Convention block, once the convention is complete: same
  // confirmation as in the status list (the volunteer gets an email)
  const validateApplication = () => setPendingStatus('Validé');

  // const handleOpen = (file) => {
  //   setSelectedFile(file);
  //   setOpen(true);
  // };

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
        {/* Back to the list, like on a student's page */}
        <Button
          size="small"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/view-users', { state: { userLogged } })}
          sx={{ mt: 2 }}>
          Tuteurs bénévoles
        </Button>
        <Stack
          direction={'row'}
          spacing={5}
          mb={2}
          mt={2}
          sx={{
            visibility:
              userLogged.user.role === 'interviewer' ? 'hidden' : 'visible',
          }}>
          <FormControlLabel
            control={
              <Switch
                checked={isActive}
                onChange={updateIsActive}
                inputProps={{ 'aria-label': 'controlled' }}
              />
            }
            label="Tuteur actif"
          />

          {/* <Button
            variant="contained"
            disabled={!showActiveConfirm}
            onClick={handleSubmitActiveChange}>
            Enregistrer
          </Button> */}
          {/* Available for a new student: computed, plus a pause */}
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                Disponibilité
              </Typography>
              <AvailabilityChip availability={user.availability} />
            </Stack>
            <UnavailableControl
              userId={user.id}
              value={user.unavailable_until}
              onChange={reloadUser}
            />
          </Stack>
        </Stack>

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
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar>
                        <Person2Icon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <>
                          {user.first_name} {user.last_name}
                          {user.is_demo && (
                            <Chip size="small" label="Démo" sx={{ ml: 1 }} />
                          )}
                        </>
                      }
                    />
                  </ListItem>
                  <ListItem
                    // Room for the two contact buttons: a long address
                    // wraps instead of running under them
                    sx={{ pr: '96px' }}
                    secondaryAction={
                      userLogged.user.role !== 'volunteer' && (
                        <Stack direction="row">
                          <EmailButton volunteer={user} />
                          <WhatsAppButton volunteer={user} />
                        </Stack>
                      )
                    }>
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
                        '&::WebkitScrollbar': {
                          width: '12px', // Width of vertical scrollbar
                        },
                        ' &::WebkitScrollbarThumb': {
                          backgroundColor: 'darkgray', // Color of the thumb
                          borderRadius: '6px', // Rounded corners
                        },
                        '&::WebkitScrollbarTrack': {
                          backgroundColor: 'lightgray', // Color of the track
                        },
                      }}
                      primary={
                        // Opens the computer's mail program
                        // One line ending with "…", full address on hover
                        <MuiLink
                          href={`mailto:${volunteerEmail(user)}`}
                          title={volunteerEmail(user)}
                          sx={{
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                          {volunteerEmail(user)}
                        </MuiLink>
                      }
                      secondary={
                        user.phone
                          ? parsePhoneNumber(user.phone).number.international
                          : null
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
                    <ListItemText
                      primary={
                        user.birth_date === null
                          ? ''
                          : user.birth_date.split('T')[0]
                      }
                      secondary=""
                    />
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
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar>
                      {/* <CategoryIcon /> */}
                      <TextSnippetIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Message de motivation"
                    secondary={user.message}
                    // primary={user.mission.title}
                    // secondary={user.mission.description}
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
                      {/* <TextSnippetIcon /> */}
                      <CategoryIcon />
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
                              maxWidth: 420,
                              backgroundColor: '#d6f6f6',
                              color: 'primary.main',
                            }}>
                            {/* <Typography variant="h6" component="div">
                              Motivation
                            </Typography> */}
                            <Typography
                              sx={{ fontStyle: 'regular' }}
                              variant="body1"
                              component="div">
                              <ListItemText
                                // primary={user.message}
                                primary={user.mission.title}
                                secondary={user.mission.description}
                              />
                            </Typography>
                          </Paper>
                        </Fade>
                      )}
                    </Popper>
                    <Typography>Cliquer ici pour voir la mission</Typography>
                    {/* <Button onClick={handleClick('top-start')}>top-end</Button> */}
                  </Box>
                </ListItemButton>
              </List>
              <Box
                sx={{
                  display:
                    userLogged.user.role === 'interviewer' ? 'none' : 'flex',
                  flexDirection: 'column',
                }}>
                <Box sx={{ minWidth: 120 }}>
                  <FormControl variant="standard" sx={{ m: 1, minWidth: 300 }}>
                    {/* <InputLabel id="demo-simple-select-label">
                      Changer le statut
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={newStatus}
                      label="Change Status"
                      onChange={handleStatusChange}
                      isoptionequaltovalue={(option, value) =>
                        value === '' || option.id === value.id
                      }>
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
                      <MenuItem value={'A télécharger'}>
                        <CustomWidthTooltip
                          placement="right"
                          title={
                            <Typography
                              sx={{ fontSize: '16px', padding: '5px' }}>
                              {longDescription('A télécharger')}
                            </Typography>
                          }
                          arrow>
                          <span>A télécharger</span>
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
                       <MenuItem value={'validé'}>Validé</MenuItem>
                    <MenuItem value={'created'}>Created</MenuItem>
                    <MenuItem value={'proposed'}>Proposed</MenuItem>
                    <MenuItem value={'selected'}>Selected</MenuItem> 
                    </Select> */}
                    <InputLabel id="demo-simple-select-label">
                      Statut
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={
                        status === 'Archivé' ? '' : newStatus || status || ''
                      }
                      disabled={status === 'Archivé'}
                      label="Statut"
                      onChange={handleStatusChange}>
                      {existingStatuses.map((status) => (
                        <MenuItem key={status} value={status}>
                          <Tooltip
                            placement="right"
                            title={
                              <Typography
                                sx={{ fontSize: '16px', padding: '5px' }}>
                                {longDescription(status)}
                              </Typography>
                            }
                            arrow>
                            <span>{status}</span>
                          </Tooltip>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ minHeight: 24 }}>
                  <SaveStatus state={statusSave} />
                </Box>
                {/* Former volunteer: archived, or button to archive */}
                {user.status === 'Archivé' ? (
                  <Alert
                    severity="warning"
                    sx={{ mt: 1 }}
                    action={
                      isManager(userLogged.user.role) && (
                        <Button color="inherit" size="small" onClick={unarchive}>
                          Désarchiver
                        </Button>
                      )
                    }>
                    Archivé
                    {user.archived_at &&
                      ` le ${new Date(user.archived_at).toLocaleDateString('fr-FR')}`}
                    {user.archive_reason && ` : ${user.archive_reason}`}
                  </Alert>
                ) : (
                  isManager(userLogged.user.role) && (
                    <Button
                      size="small"
                      color="warning"
                      startIcon={<ArchiveIcon />}
                      sx={{ mt: 1, alignSelf: 'flex-start' }}
                      onClick={() => {
                        setArchiveBlocked([]);
                        setArchiving(true);
                      }}>
                      Archiver ce bénévole
                    </Button>
                  )
                )}
                <ArchiveDialog
                  open={archiving}
                  title={`Archiver ${user.first_name} ${user.last_name}`}
                  blocked={archiveBlocked}
                  onClose={() => setArchiving(false)}
                  onConfirm={archive}
                />
                <Dialog
                  open={!!pendingStatus}
                  onClose={() => setPendingStatus(null)}>
                  <DialogTitle>Passer en « {pendingStatus} » ?</DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      Ce statut envoie un e-mail au bénévole. Continuer ?
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setPendingStatus(null)}>
                      Annuler
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => {
                        const value = pendingStatus;
                        setPendingStatus(null);
                        saveStatus(value);
                      }}>
                      Continuer
                    </Button>
                  </DialogActions>
                </Dialog>
                <Box mt={1}>
                  <Typography variant="body2" mt={2}>
                    Cliquer pour éditer le profil du tuteur
                  </Typography>
                  <Button
                    sx={{ width: 'fit-content' }}
                    variant="outlined"
                    color="secondary"
                    onClick={handleEditUserProfile}>
                    Editer profil
                  </Button>
                  <Typography variant="body2" mt={2}>
                    Supprimer le compte du tuteur
                  </Typography>
                  <Button
                    sx={{ width: 'fit-content' }}
                    variant="outlined"
                    color="warning"
                    onClick={handleCancelRegistration}>
                    Supprimer le compte
                  </Button>
                </Box>
              </Box>
            </BorderedBoxWithLabel>
          </Grid>
          <Grid item xs={12} md={4} lg={3}>
            <BorderedBoxWithLabel label="Quoi & quand" sx={{ display: 'flex' }}>
              {user.skill ? (
                <>
                  <Box mt={3}>
                    <Typography variant="h6" component="span">
                      Matière(s)
                    </Typography>

                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                      {user.skill &&
                        user.skill.topics !== null &&
                        user.skill.topics.map((topic, i) => (
                          <div key={i}>
                            {JSON.parse(topic).subject.label
                              ? JSON.parse(topic).subject.label
                              : JSON.parse(topic).subject}{' '}
                            de {JSON.parse(topic).classStart} à{' '}
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
                      {!user.skill.availability
                        ? ''
                        : user.skill.availability.min ===
                          user.skill.availability.max
                        ? `Peut effectuer ${user.skill.availability.min}  heure(s) hebdomadaire(s)`
                        : `Peut effectuer ${user.skill.availability.min} à ${user.skill.availability.max} heures hebdomadaires`}
                    </Typography>
                  </Box>
                  <Box mt={2}>
                    <Typography variant="h6" component="div">
                      Lieu(x)
                    </Typography>
                    {/* Modality first: "A distance" or "Sur site ou à
                        distance" needs no site, the block is not empty */}
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                      {user.skill?.how_location && (
                        <div>
                          Modalité : <b>{user.skill.how_location}</b>
                        </div>
                      )}
                      {(user.skill?.where_location || [])
                        .filter(Boolean)
                        .map((location, i) => (
                          <div key={i}>{location}</div>
                        ))}
                      {user.skill?.how_location !== 'A distance' &&
                        !(user.skill?.where_location || []).some(Boolean) && (
                          <div>Aucun site indiqué</div>
                        )}
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
            {/* <TopicGradeComponent userSelected={user.id} /> */}
            <BorderedBoxWithLabel
              label="Premier contact"
              sx={{ display: 'flex' }}>
              <PreInterviewComponent userId={user.id} />
            </BorderedBoxWithLabel>
            {/* Discussion between admins about this volunteer */}
            {isManager(userLogged.user.role) && (
              <BorderedBoxWithLabel
                label="Fil de discussion interne"
                sx={{ display: 'flex' }}>
                <Box
                  sx={{
                    height: 'calc(100% - 60px)',
                    backgroundColor: '#F5F5F5',
                    borderRadius: '7px',
                  }}>
                  <DiscussionThread userId={user.id} />
                </Box>
              </BorderedBoxWithLabel>
            )}
          </Grid>

          <Grid item xs={12} md={4} lg={3}>
            <BorderedBoxWithLabel label="Entretiens" sx={{ display: 'flex' }}>
              <FormInterviewComponent userId={user.id} />
            </BorderedBoxWithLabel>
            <BorderedBoxWithLabel label="Cohortes" sx={{ display: 'flex' }}>
              <CohortTransferList userId={user.id} />
            </BorderedBoxWithLabel>
          </Grid>
          <Grid item xs={12} md={4} lg={3}>
            <BorderedBoxWithLabel label="Documents" sx={{ display: 'flex' }}>
              <Box
                sx={{
                  display: userLogged.user.role === 'interviewer' && 'none',
                }}>
                <DocumentCheckbox user={user} />
              </Box>
              {/* Typed slots are always shown, so admins can upload too */}
              <Box mt={2}>
                <DocumentSlots userId={user.id} />
              </Box>
            </BorderedBoxWithLabel>
            {/* Volunteer's signature, president's countersignature, validation */}
            <BorderedBoxWithLabel label="Convention" sx={{ display: 'flex' }}>
              <ConventionSteps
                userId={user.id}
                admin={isManager(userLogged.user.role)}
                onValidate={
                  isManager(userLogged.user.role) ? validateApplication : undefined
                }
              />
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
