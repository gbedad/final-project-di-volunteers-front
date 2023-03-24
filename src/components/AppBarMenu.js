import  React, {useState, useEffect} from 'react';
import {useNavigate, useLocation} from 'react-router-dom'
import axios from 'axios';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import AdbIcon from '@mui/icons-material/Adb';
import { replaceInvalidDateByNull } from '@mui/x-date-pickers/internals';

const pages = ['Products', 'Pricing', 'Blog'];
const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];

function ResponsiveAppBar() {
    const navigate = useNavigate();
    const location = useLocation()
    const [anchorElNav, setAnchorElNav] = React.useState(null);
    const [anchorElUser, setAnchorElUser] = React.useState(null);
    console.log(location);
    let userLogged = ''
    if (location.state) {
      userLogged = location.state.userLogged
    }
    

    const handleOpenNavMenu = (event) => {
      setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event) => {
      setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
      setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
      setAnchorElUser(null);
    };

    const handleLogout = async (req, res) => {
      try {
          await axios.get('/logout')
          navigate('/')
      }
      catch (err) {
          console.log(err)
      }   
    }

    const handleLogin = async (req, res) => {
      try {
        navigate('/login')
      }
      catch (err) {
        console.log(err)
      }
    }

    const handleProfile = () => {
      console.log("Go to profile page")
    }

    const handleViewUsers = () => {
      if (userLogged.role === 'admin') {
        navigate('/view-users', {state:{userLogged}})
      }
    }


  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            MISSION...POSSIBLE
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {/* {pages.map((page) => (
                <MenuItem key={page} onClick={handleCloseNavMenu}>
                  <Typography textAlign="center">{page}</Typography>
                </MenuItem>
              ))} */}
              {!location.state ?

              <MenuItem>
                <Typography textAlign="center">Login</Typography>
              </MenuItem>: <span></span>
            }
            </Menu>
          </Box>
          <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href=""
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            LOGO
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {!location.state ?
            <Button onClick={handleLogin} sx={{ my: 2, color: 'white', display: 'block' }}>Login</Button> : <span></span>
            }
          </Box>
         
          <Box sx={{ flexGrow: 0 }}>
          {location.state && location.state.userLogged ?
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar>{location.state.userLogged.first_name.charAt(0).toUpperCase()}{location.state.userLogged.last_name.charAt(0).toUpperCase()}</Avatar>
              </IconButton>
            </Tooltip> : <span></span>
}
            {location.state !== null ?
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {(location.pathname !== '/register' || location.pathname === '/view-users') && location.state && location.state.userLogged.role === 'admin' ? 
                <div>
                  <MenuItem onClick={handleViewUsers}><Typography textAlign="center">Dashboard</Typography></MenuItem>
                  <MenuItem onClick={handleLogout}><Typography textAlign="center">Logout</Typography></MenuItem>
                </div> : 
                location.pathname !== '/profile' &&  location.pathname !== '/register' && location.state && location.state.userLogged.role && location.state.userLogged.role === 'volunteer' ?
                <div>
                  <MenuItem onClick={handleProfile}><Typography textAlign="center">Profile</Typography></MenuItem> 
                  <MenuItem onClick={handleLogout}><Typography textAlign="center">Logout</Typography></MenuItem>
                </div> 
                : 
                <MenuItem onClick={handleLogout}><Typography textAlign="center">Logout</Typography></MenuItem>
                }
            </Menu>
             : <span></span>}
          </Box>
         
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;