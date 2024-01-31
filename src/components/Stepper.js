import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import Profile from './Profile';
import Skills from './Skills';
import Uploads from './FileUploader';
import InstructionComponent from '../components/files/Instructions';
import ConventionComponent from './ConventionReciproqueComponent';

import RefreshButton from './refreshIcon';

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

  // console.log(location.state.userSelected);

  const handleChange = (event, newValue) => {
    let userStatus = '';
    if (location.state.userSelected) {
      userStatus = location.state.userSelected.status;
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

  // let userId = location.state.userLogged
  //   ? location.state.userLogged.user.id
  //   : location.state.userSelected.id;

  // console.log(userId);
  // console.log(status);

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
  }, [value]);

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
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
            centered>
            <Tab label="MON PROFIL" {...a11yProps(0)} />
            <Tab
              label="JE PEUX AIDER"
              {...a11yProps(1)}
              disabled={status === 'Compte créé'}
            />
            <Tab
              label="MES DOCUMENTS"
              {...a11yProps(2)}
              disabled={status === 'Compte créé' || status === 'Déclinée'}
            />
            <Tab
              label="MA CONVENTION"
              {...a11yProps(3)}
              disabled={
                status === 'Compte créé' ||
                status === 'A renseigner' ||
                status === 'A interviewer' ||
                status === 'A finaliser'
              }
            />
            <RefreshButton getUser={getUser} />
          </Tabs>
        </Box>
      </Box>

      <TabPanel value={value} index={0}>
        <Profile status={status} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Skills userId={userId} />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <div>
          <InstructionComponent />
          <Uploads userSelected={userId} />
        </div>
      </TabPanel>
      <TabPanel value={value} index={3}>
        <ConventionComponent />
      </TabPanel>
    </div>
  );
};

export default BasicTabs;
