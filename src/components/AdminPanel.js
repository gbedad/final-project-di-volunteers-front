import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { styled, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
// import Badge from '@mui/material/Badge';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
// import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

// import NotificationsIcon from '@mui/icons-material/Notifications';
import { mainListItems, secondaryListItems } from './ListItems';
import Users from './Users';
import ActiveUsers from './ActiveUsers';
import UsersByStatusGrid from './UsersByStatus';

import { UserContext } from '../UserContext';
import { AuthProvider } from '../AuthContext';

import { useAuth } from '../AuthContext.js';

import { isTokenExpired } from './js/auth.js';

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        DI Final Project Gerald Berrebi
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  '& .MuiDrawer-paper': {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: 'border-box',
    ...(!open && {
      overflowX: 'hidden',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

// const mdTheme = createTheme();

function DashboardContent() {
  const location = useLocation();
  const [open, setOpen] = React.useState(true);
  // const token = localStorage.getItem('token');
  const { user } = useContext(UserContext);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dataActive, setDataActive] = useState([]);
  const [activeUsers, setActiveUsers] = useState(null);
  const [countUsersByStatus, setCountUsersByStatus] = useState({});
  // console.log(location.state);
  const userLogged = location.state.userLogged.user;

  // const { logout } = useAuth();

  // console.log(logout());

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     const token = localStorage.getItem('token');
  //     console.log(isTokenExpired(token));
  //     if (!token || isTokenExpired(token)) {
  //       logout();
  //     }
  //   }, 3600000); // Check every minute

  //   return () => clearInterval(interval);
  // }, []);

  useEffect(() => {
    const fetchUserList = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/all-users`, {
          headers: {
            /* `"x-access-token":user.token` is setting the `x-access-token` header in the HTTP request
            to the `user.token` value. This is commonly used for authentication and authorization
            purposes, where the server expects a token to be included in the request headers to
            identify and validate the user making the request. */
            'x-access-token': user.token,
          },
        });
        // console.log("Response",response)

        const filteredData = response.data.filter(
          (item) => item.is_active === true
        );
        const rowCounts = response.data.reduce((acc, item) => {
          const { status } = item;
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});
        setUsers(response.data);
        setDataActive(filteredData);
        setActiveUsers(filteredData.length);
        setCountUsersByStatus(rowCounts);

        //   return response.data;
      } catch (error) {
        console.error(error);
      }
    };

    fetchUserList();
  }, []);

  // console.log('Active Users', activeUsers);
  // console.log('By Status', countUsersByStatus);

  // console.log(users);

  const toggleDrawer = () => {
    setOpen(!open);
  };
  // console.log(location);
  return (
    // <ThemeProvider theme={mdTheme}>
    <>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        {userLogged.role === 'admin' || userLogged.role === 'interviewer' ? (
          <Drawer variant="permanent" open={!open}>
            <Toolbar
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                px: [1],
              }}>
              <IconButton onClick={toggleDrawer}>
                <ChevronLeftIcon />
              </IconButton>
            </Toolbar>
            <Divider />
            <List component="nav">
              {mainListItems}
              <Divider sx={{ my: 1 }} />
              {/* {secondaryListItems} */}
            </List>
          </Drawer>
        ) : (
          <></>
        )}
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
          }}>
          <Toolbar />
          <Container maxWidth="lg" sx={{ mt: 0, mb: 2 }}>
            <Grid container spacing={1}>
              <Grid item xs={12} md={10} lg={10}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    height: 140,
                  }}>
                  <UsersByStatusGrid data={countUsersByStatus} />
                </Paper>
              </Grid>

              <Grid item xs={12} md={2} lg={2}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    height: 140,
                  }}>
                  <ActiveUsers data={activeUsers} />
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                  <Users data={users} />
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
      {/* </ThemeProvider> */}
    </>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}
