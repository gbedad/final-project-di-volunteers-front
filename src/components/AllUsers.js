import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { mainListItems, secondaryListItems } from './ListItems';
import Users from './Users';
import Users2 from './Users2';
import ActiveUsers from './ActiveUsers';
import UsersByStatusGrid from './UsersByStatus';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import LayersIcon from '@mui/icons-material/Layers';
import AssignmentIcon from '@mui/icons-material/Assignment';

import { UserContext } from '../UserContext';

import SearchBar from './SearchBar';

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Association Séphora Berrebi by Gerald Berrebi
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

const mdTheme = createTheme();

function DashboardContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(true);
  const token = localStorage.getItem('token');
  const { user } = useContext(UserContext);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dataActive, setDataActive] = useState([]);
  const [activeUsers, setActiveUsers] = useState(null);
  const [countUsersByStatus, setCountUsersByStatus] = useState({});
  // console.log(location.state);
  const userLogged = location.state.userLogged;

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
        console.log(response.data);
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
  const handleViewUsers = () => {
    if (userLogged.user.role === 'admin') {
      navigate(`/view-users`, { state: { userLogged } });
    }
  };
  const handleViewMissions = () => {
    if (userLogged.user.role === 'admin') {
      navigate(`/missions`, { state: { userLogged } });
    }
  };

  const toggleDrawer = () => {
    setOpen(!open);
  };
  // console.log(location);
  return (
    <ThemeProvider theme={mdTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />

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
          <Container maxWidth="xl" sx={{ mt: 0, mb: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8} lg={8}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    height: 100,
                  }}>
                  <UsersByStatusGrid data={countUsersByStatus} />
                </Paper>
              </Grid>

              <Grid item xs={12} md={4} lg={4}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    height: 100,
                  }}>
                  <ActiveUsers data={activeUsers} />
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                  {/* <Users data={users} /> */}
                  <Users2 data={users} />
                </Paper>
              </Grid>
            </Grid>
            <Copyright sx={{ pt: 4 }} />
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}
