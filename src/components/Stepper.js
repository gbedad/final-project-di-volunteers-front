import * as React from 'react';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import Profile from './Profile';
import Skills from './Skills';
import Uploads from './FileUploader';

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

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  let status = location.state.userLogged.user.status;
  console.log(location.state.userLogged.user.status);
  return (
    <div sx={{ mt: 0, mb: 4 }}>
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          justifyContent: 'center',
        }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
          centered>
          <Tab label="MON PROFIL" {...a11yProps(0)} />
          <Tab
            label="JE PEUX AIDER"
            {...a11yProps(1)}
            disabled={status === 'created'}
          />
          <Tab
            label="MES DOCUMENTS"
            {...a11yProps(2)}
            disabled={status === 'created' || status === 'proposed'}
          />
        </Tabs>
      </Box>

      <TabPanel value={value} index={0}>
        <Profile />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Skills />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Uploads />
      </TabPanel>
    </div>
  );
};

export default BasicTabs;
