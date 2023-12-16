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
  const [status, setStatus] = useState(localStorage.getItem('user-status'));

  const handleChange = (event, newValue) => {
    let userStatus = localStorage.getItem('user-status');
    console.log(userStatus);
    setStatus(userStatus);
    setValue(newValue);
  };
  let userId = location.state.userLogged.user.id;
  console.log(location.state.userLogged.user.id);

  const getUser = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/user-by-id/${userId}`
      );
      console.log(response.data.status);
      setStatus(response.data.status);
    } catch (err) {
      console.lor(err);
    }

    //   const parsed_array = response.data.skill.locations.map(string => JSON.parse(string));
    console.log(status);
  };

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
              disabled={status === 'compte créé'}
            />
            <Tab
              label="MES DOCUMENTS"
              {...a11yProps(2)}
              disabled={status === 'compte créé' || status === 'déclinée'}
            />
            <Tab
              label="MA CONVENTION"
              {...a11yProps(3)}
              disabled={
                status === 'compte créé' ||
                status === 'à renseigner' ||
                status === 'à interviewer' ||
                status === 'à finaliser'
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
          <Uploads />
        </div>
      </TabPanel>
      <TabPanel value={value} index={3}>
        <ConventionComponent />
      </TabPanel>
    </div>
  );
};

export default BasicTabs;
