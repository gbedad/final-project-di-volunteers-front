import React, { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useJwt } from 'react-jwt';

import { AuthContext, AuthProvider } from '../AuthContext';
import axios from 'axios';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';

import Profile from './Profile';
import Skills from './Skills';
import InstructionComponent from '../components/files/Instructions';

import RefreshButton from './refreshIcon';

import StepperStatusTimeline from './StepperStatusTimeline';
// import { setStatusStep } from '../js/statusDescription';
import { setStatusStep } from '../js/statusDescription';
import ConventionSteps from './application/ConventionSteps';
import MyStudents from './application/MyStudents';
import ApplicationChecklist from './application/ApplicationChecklist';
import DocumentSlots from './application/DocumentSlots';
import MissingBanner from './application/MissingBanner';
import {
  useApplicationProgress,
  missingItems,
} from '../js/applicationProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import Button from '@mui/material/Button';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import Error404 from '../pages/404';
import DocumentsBanner from './application/DocumentsBanner';
import { isManager } from '../js/roles';

const HtmlTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#c8f5e9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #7b1fa2',
  },
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}>
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const BasicTabs = () => {
  const isAuthenticated = useContext(AuthContext);
  const navigate = useNavigate();

  const location = useLocation();
  // Opened on a given tab from an email link (e.g. the convention)
  const [value, setValue] = React.useState(location.state?.tab ?? 0);
  const [status, setStatus] = useState('');
  const [screenSize, setScreenSize] = useState('');
  const [finished, setFinished] = React.useState(false);

  // Update screen size on mount and on window resize

  // console.log(isAuthenticated);
  const { decodedToken, isExpired, reEvaluateToken } = useJwt(
    isAuthenticated.token
  );

  // console.log(decodedToken);
  // const tokenExp = new Date(decodedToken.exp * 1000);
  useEffect(() => {
    const refresh = async () => {
      try {
        await isAuthenticated.refreshToken();
      } catch (error) {
        console.error(error);
        isAuthenticated.logout();
      }
    };

    if (isAuthenticated.token) {
      let tokenExp;
      if (decodedToken && decodedToken.exp) {
        tokenExp = new Date(decodedToken.exp * 1000);
      }
      const now = new Date();
      // console.log(tokenExp);

      // Refresh token if it's about to expire
      if (tokenExp - now < 60 * 1000) {
        refresh();
      }
    }
  }, []);
  // console.log(isExpired);

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 600) {
        setScreenSize('sm');
      } else if (width < 960) {
        setScreenSize('md');
      } else {
        setScreenSize('lg');
      }
    };

    updateScreenSize(); // Initial call
    window.addEventListener('resize', updateScreenSize);

    return () => {
      window.removeEventListener('resize', updateScreenSize);
    };
  }, []);

  // console.log(location.state.userSelected);

  const handleChange = async (event, newValue) => {
    let userStatus = '';
    if (location.state.userSelected) {
      userStatus = await location.state.userSelected.status;
    } else {
      userStatus = localStorage.getItem('user-status');
    }

    // console.log(userStatus);
    setStatus(userStatus);
    setValue(newValue);
  };
  let userId = '';
  if (location.state) {
    if (
      (location.state.userLogged &&
        location.state.userSelected &&
        location.state.userLogged.user.id === location.state.userSelected.id) ||
      !location.state.userSelected
    ) {
      userId = location.state.userLogged.user.id;
    } else {
      userId = location.state.userSelected.id;
    }
  }

  // const handleStepFinish = (newState) => {
  //   setFinished(newState);
  // };

  // What is missing, to guide the volunteer on each tab
  const [progress] = useApplicationProgress(userId);
  // The volunteer's own space (not an admin editing a profile)
  const ownSpace = String(userId) === String(location.state?.userLogged?.user?.id);
  const missing = progress ? missingItems(progress) : null;
  const tabState = (items) =>
    !items || status === 'Déclinée'
      ? {}
      : {
          icon: items.length ? (
            <FiberManualRecordIcon
              sx={{ fontSize: 12, color: 'warning.main' }}
              titleAccess="Informations manquantes"
            />
          ) : (
            <CheckCircleIcon
              sx={{ fontSize: 16, color: 'success.main' }}
              titleAccess="Complet"
            />
          ),
          iconPosition: 'end',
        };

  const getUser = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/user-by-id/${userId}`
      );
      // console.log(response.data.status);
      setStatus(response.data.status);
    } catch (err) {
      console.log(err);
    }

    //   const parsed_array = response.data.skill.locations.map(string => JSON.parse(string));
    // console.log(status);
  };
  useEffect(() => {
    getUser();
    // eslint-disable-next-line
  }, [value]);

  // console.log('Finished ?', finished);

  // console.log(isAuthenticated.isLoggedIn);
  // console.log(location.state);

  return (
    <AuthProvider>
      {!isAuthenticated.isLoggedIn && location.state === null ? (
        <Error404 />
      ) : (
        <div
          sx={{
            mt: 0,
            mb: 4,
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
          }}>
          <Box
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              justifyContent: 'center',
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'column',
            }}>
            {location.state.userSelected && (
              <Typography
                mt={2}
                variant="h5"
                component="h6"
                sx={{ color: 'primary.main' }}>
                Edition du profil de {location.state.userSelected.first_name}{' '}
                {location.state.userSelected.last_name}
              </Typography>
            )}
            <Box>
              <Tabs
                orientation={
                  screenSize === 'md' || screenSize === 'sm'
                    ? 'vertical'
                    : 'horizontal'
                }
                value={value}
                onChange={handleChange}
                aria-label="basic tabs example"
                centered>
                <Tab label="MON STATUT" {...a11yProps(0)} />
                <Tab
                  label="MON PROFIL"
                  {...a11yProps(0)}
                  {...tabState(missing?.profile)}
                />
                {/* Profile, wishes and documents can be filled in any order */}
                <Tab
                  label="MES DISPONIBILITÉS"
                  {...a11yProps(1)}
                  {...tabState(missing?.wishes)}
                  disabled={status === 'Déclinée'}
                />
                <Tab
                  label="MES DOCUMENTS"
                  {...a11yProps(2)}
                  {...tabState(missing?.documents)}
                  disabled={status === 'Déclinée'}
                />
                <Tab
                  label="MA CONVENTION"
                  {...a11yProps(3)}
                  disabled={
                    status === 'Compte créé' ||
                    status === 'A renseigner' ||
                    status === 'A télécharger' ||
                    status === 'A interviewer' ||
                    status === 'Déclinée'
                  }
                  style={{
                    color:
                      status === 'Compte créé' ||
                      status === 'A renseigner' ||
                      status === 'A télécharger' ||
                      status === 'A interviewer' ||
                      (status === 'Déclinée' && 'text.disabled'),
                  }}
                />
                {/* The tutor's own students (not shown when an admin edits) */}
                {ownSpace && (
                  <Tab
                    label="MES ÉLÈVES"
                    {...a11yProps(5)}
                    disabled={!['Validé', 'A conserver'].includes(status)}
                  />
                )}
                <Box display="flex" justifyContent="center" alignItems="center">
                  <RefreshButton getUser={getUser} setFinished={setFinished} />
                </Box>
                <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                  alignItems="center">
                  <Box>
                    <List>
                      <ListItem>
                        <ListItemAvatar>
                          <HtmlTooltip
                            title={
                              <React.Fragment>
                                <Typography
                                  color="secondary.dark"
                                  fontSize={13}>
                                  L'étape à laquelle vous en êtes, sur un total
                                  de 6 étapes (cf. FAQ).
                                </Typography>
                              </React.Fragment>
                            }>
                            <Avatar sx={{ bgcolor: 'secondary.main' }}>
                              {setStatusStep(status)}
                            </Avatar>
                          </HtmlTooltip>
                        </ListItemAvatar>

                        {/* <ListItemText primary={shortDescription(status)} /> */}
                      </ListItem>
                    </List>
                  </Box>
                </Box>
              </Tabs>
            </Box>
          </Box>
          <TabPanel
            value={value}
            index={0}
            style={{
              display: 'flex',
              justifyContent: 'center',
              position: 'relative',
            }}>
            {/* <StatusTimelineComponent userStatusStep={setStatusStep(status)} /> */}

            <Box sx={{ width: '100%' }}>
              <ApplicationChecklist
                userId={userId}
                onGoToTab={setValue}
                onStatusChange={setStatus}
              />
            </Box>
            <StepperStatusTimeline
              userStatusStep={setStatusStep(status)}
              handleChange={handleChange}
              finished={finished}
              conventionState={progress?.convention?.state}
            />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <MissingBanner
              items={missing?.profile}
              done="Votre profil est complet."
            />
            <Profile status={status} />
          </TabPanel>
          <TabPanel value={value} index={2}>
            <MissingBanner
              items={missing?.wishes}
              done="Vos souhaits et disponibilités sont complets."
            />
            <Skills userId={userId} />
          </TabPanel>
          <TabPanel value={value} index={3}>
            <div>
              <DocumentsBanner progress={progress} />
              <InstructionComponent />
              <DocumentSlots userId={userId} />
            </div>
          </TabPanel>
          <TabPanel value={value} index={4}>
            <ConventionSteps
              userId={userId}
              admin={isManager(location.state?.userLogged?.user?.role)}
            />
          </TabPanel>
          {ownSpace && (
            <TabPanel value={value} index={5}>
              <MyStudents />
            </TabPanel>
          )}
          {value > 0 && (
            <Box sx={{ position: 'fixed', top: '70px', right: '20px' }}>
              <Button
                variant="contained"
                startIcon={<AssignmentIcon />}
                onClick={() => setValue(0)}>
                Voir mon dossier
              </Button>
            </Box>
          )}
        </div>
      )}
    </AuthProvider>
  );
};

export default BasicTabs;
