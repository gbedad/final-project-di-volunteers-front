import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';

import Profile from './Profile';
import Skills from './Skills';
import Uploads from './FileUploader';
import InstructionComponent from '../components/files/Instructions';
import ConventionComponent from './ConventionReciproqueComponent';

import RefreshButton from './refreshIcon';
import StatusTimelineComponent from './TimeLineStatus/StatusTimeline';
import StepperStatusTimeline from './StepperStatusTimeline';
// import { setStatusStep } from '../js/statusDescription';
import { shortDescription, setStatusStep } from '../js/statusDescription';
import UploadConventionComponent from './FileConventionUploader';
import FloatingButton from './FloatingButton';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';

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
  const location = useLocation();
  const [value, setValue] = React.useState(0);
  const [status, setStatus] = useState('');
  const [screenSize, setScreenSize] = useState('');
  const [finished, setFinished] = React.useState(false);

  // Update screen size on mount and on window resize
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

  const handleStepFinish = (newState) => {
    setFinished(newState);
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

  console.log('Finished ?', finished);

  return (
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
            <Tab label="MON PROFIL" {...a11yProps(0)} />
            <Tab
              label="MES DISPONIBILITÉS"
              {...a11yProps(1)}
              disabled={status === 'Déclinée'}
              style={{
                color:
                  status === 'Compte créé' ||
                  (status === 'Déclinée' && 'text.disabled'),
              }}
            />
            <Tab
              label="MES DOCUMENTS"
              {...a11yProps(2)}
              disabled={
                status === 'Compte créé' ||
                status === 'A renseigner' ||
                status === 'Déclinée'
              }
              style={{
                color:
                  status === 'Compte créé' ||
                  status === 'A renseigner' ||
                  (status === 'Déclinée' && 'text.disabled'),
              }}
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
                            <Typography color="secondary.dark" fontSize={13}>
                              L'étape à laquelle vous en êtes, sur un total de 6
                              étapes (cf. FAQ).
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

        <StepperStatusTimeline
          userStatusStep={setStatusStep(status)}
          handleChange={handleChange}
          finished={finished}
        />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Profile status={status} />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Skills userId={userId} />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <div>
          <InstructionComponent />
          <Uploads userSelected={userId} />
        </div>
      </TabPanel>
      <TabPanel value={value} index={4}>
        <ConventionComponent />
        <UploadConventionComponent userSelected={userId} />
      </TabPanel>
      {value > 0 && (
        <Box sx={{ position: 'fixed', top: '70px', right: '20px' }}>
          <FloatingButton
            handleChange={handleChange}
            setFinished={setFinished}
          />
        </Box>
      )}
    </div>
  );
};

export default BasicTabs;
