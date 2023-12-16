import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, useHistory } from 'react-router-dom';
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
// import Link from '@mui/material/Link';
import { replaceInvalidDateByNull } from '@mui/x-date-pickers/internals';

import CastForEducationIcon from '@mui/icons-material/CastForEducation';
import logo from '../assets/mycogniverse3.gif';

const pages = ['Missions bénévoles', 'A propos'];
const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];

const BASE_URL = process.env.REACT_APP_BASE_URL;

function ResponsiveAppBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  let userLogged = '';
  if (location.state) {
    userLogged = location.state.userLogged;
  }
  console.log('=======>', userLogged);

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

  const handleLogout = async () => {
    try {
      await axios.get(`${BASE_URL}/logout`);
      localStorage.removeItem('token');
      localStorage.removeItem('token1');
      localStorage.removeItem('users');
      localStorage.removeItem('user');
      navigate('/');
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogin = async () => {
    try {
      navigate('/login');
    } catch (err) {
      console.log(err);
    }
  };

  const handleGoToPage = async (page) => {
    try {
      if (page === "L'association") {
        navigate('/', { state: { userLogged } });
      }
      if (
        page === 'Missions bénévoles' &&
        (!userLogged || userLogged.user.role === 'volunteer')
      ) {
        navigate('/missions', { state: { userLogged } });
      }
      if (page === 'Missions bénévoles' && userLogged.user.role === 'admin') {
        navigate('/all-missions', { state: { userLogged } });
      }
      if (page === 'A propos') {
        navigate('/tutorat', { state: { userLogged } });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogoClick = async () => {
    try {
      navigate('/', { state: { userLogged } });
    } catch (err) {
      console.log(err);
    }
  };

  const handleProfile = () => {
    if (userLogged.user.role === 'volunteer') {
      navigate(`/stepper`, { state: { userLogged } });
    }
  };

  const handleViewUsers = () => {
    if (userLogged.user.role === 'admin') {
      navigate(`/view-users`, { state: { userLogged } });
    }
  };

  const handleEditMissions = () => {
    if (userLogged.user.role === 'admin') {
      navigate(`/all-missions`, { state: { userLogged } });
    }
  };

  // return (
  //   <AppBar position="static">
  //     <Container maxWidth="xl">
  //       <Toolbar disableGutters>
  //         <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
  //         <Typography
  //           variant="h6"
  //           noWrap
  //           component="a"
  //           href="/"
  //           sx={{
  //             mr: 2,
  //             display: { xs: 'none', md: 'flex' },
  //             fontFamily: 'monospace',
  //             fontWeight: 700,
  //             letterSpacing: '.3rem',
  //             color: 'inherit',
  //             textDecoration: 'none',
  //           }}></Typography>

  //         <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
  //           <IconButton
  //             size="large"
  //             aria-label="account of current user"
  //             aria-controls="menu-appbar"
  //             aria-haspopup="true"
  //             onClick={handleOpenNavMenu}
  //             color="inherit">
  //             <MenuIcon />
  //           </IconButton>
  //           <Menu
  //             id="menu-appbar"
  //             anchorEl={anchorElNav}
  //             anchorOrigin={{
  //               vertical: 'bottom',
  //               horizontal: 'left',
  //             }}
  //             keepMounted
  //             transformOrigin={{
  //               vertical: 'top',
  //               horizontal: 'left',
  //             }}
  //             open={Boolean(anchorElNav)}
  //             onClose={handleCloseNavMenu}
  //             sx={{
  //               display: { xs: 'block', md: 'none' },
  //             }}>
  //             {pages.map((page) => (
  //               <MenuItem key={page} onClick={handleCloseNavMenu}>
  //                 <Typography textAlign="center">{page}</Typography>
  //               </MenuItem>
  //             ))}
  //             {!location.state || !location.state.userLogged ? (
  //               <MenuItem onClick={handleLogin}>
  //                 <Typography textAlign="center">Login</Typography>
  //               </MenuItem>
  //             ) : (
  //               <MenuItem onClick={handleLogin}>
  //                 <Typography textAlign="center">Login</Typography>
  //               </MenuItem>
  //             )}
  //           </Menu>
  //         </Box>
  //         <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
  //         <Typography
  //           variant="h5"
  //           noWrap
  //           component="a"
  //           href="/"
  //           sx={{
  //             mr: 2,
  //             display: { xs: 'flex', md: 'none' },
  //             flexGrow: 1,
  //             fontFamily: 'monospace',
  //             fontWeight: 700,
  //             letterSpacing: '.3rem',
  //             color: 'inherit',
  //             textDecoration: 'none',
  //           }}>
  //           MISSION
  //         </Typography>
  //         <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
  //           {pages.map((page) => (
  //             <Button
  //               key={page}
  //               onClick={() => handleGoToPage(page)}
  //               sx={{ my: 2, color: 'white', display: 'block' }}>
  //               {page}
  //             </Button>
  //           ))}
  //         </Box>

  //         <Box sx={{ flexGrow: 0 }}>
  //           {userLogged ? (
  //             <span></span>
  //           ) : (
  //             <MenuItem>
  //               {/* <Typography textAlign="center">Login</Typography> */}
  //               <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
  //                 <Button
  //                   onClick={handleLogin}
  //                   sx={{ my: 2, color: 'white', display: 'block' }}>
  //                   Login
  //                 </Button>
  //               </Box>
  //             </MenuItem>
  //           )}
  //           {location.state && location.state.userLogged ? (
  //             <Tooltip title="Open settings">
  //               <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
  //                 <Avatar>
  //                   {location.state.userLogged.user.first_name
  //                     .charAt(0)
  //                     .toUpperCase()}
  //                   {location.state.userLogged.user.last_name
  //                     .charAt(0)
  //                     .toUpperCase()}
  //                 </Avatar>
  //               </IconButton>
  //             </Tooltip>
  //           ) : (
  //             <span></span>
  //           )}
  //           {location.state !== null ? (
  //             <Menu
  //               sx={{ mt: '45px' }}
  //               id="menu-appbar"
  //               anchorEl={anchorElUser}
  //               anchorOrigin={{
  //                 vertical: 'top',
  //                 horizontal: 'right',
  //               }}
  //               transformOrigin={{
  //                 vertical: 'top',
  //                 horizontal: 'right',
  //               }}
  //               open={Boolean(anchorElUser)}
  //               onClose={handleCloseUserMenu}>
  //               {(location.pathname !== '/register' ||
  //                 location.pathname === '/view-users') &&
  //               location.state.userLogged &&
  //               location.state.userLogged.user.role === 'admin' ? (
  //                 <div>
  //                   <MenuItem onClick={handleViewUsers}>
  //                     <Typography textAlign="center">Dashboard</Typography>
  //                   </MenuItem>
  //                   <MenuItem onClick={handleEditMissions}>
  //                     <Typography textAlign="center">Missions</Typography>
  //                   </MenuItem>
  //                   <MenuItem onClick={handleLogout}>
  //                     <Typography textAlign="center">Logout</Typography>
  //                   </MenuItem>
  //                 </div>
  //               ) : location.pathname !== '/profile' &&
  //                 location.pathname !== '/register' &&
  //                 location.state &&
  //                 location.state.userLogged.user &&
  //                 location.state.userLogged.user.role === 'volunteer' ? (
  //                 <div>
  //                   {/* <MenuItem onClick={handleProfile}>
  //                     <Typography textAlign="center">Profile</Typography>
  //                   </MenuItem> */}
  //                   <MenuItem onClick={handleLogout}>
  //                     <Typography textAlign="center">Logout</Typography>
  //                   </MenuItem>
  //                 </div>
  //               ) : (
  //                 <MenuItem onClick={handleLogout}>
  //                   <Typography textAlign="center">Logout</Typography>
  //                 </MenuItem>
  //               )}
  //             </Menu>
  //           ) : (
  //             <span></span>
  //           )}
  //         </Box>
  //       </Toolbar>
  //     </Container>
  //   </AppBar>
  // );

  return (
    <AppBar position="static" color="primary">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            onClick={handleLogoClick}
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}>
            <Box component="img" sx={{ height: 54 }} alt="Logo" src={logo} />
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit">
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
              onBlur={handleCloseNavMenu}
              onClick={handleCloseNavMenu}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}>
              {pages.map((page) => (
                <MenuItem key={page} onClick={handleCloseNavMenu}>
                  <Typography textAlign="center">{page}</Typography>
                </MenuItem>
              ))}
              {!location.state || !location.state.userLogged ? (
                <MenuItem onClick={handleLogin}>
                  <Typography textAlign="center">Login</Typography>
                </MenuItem>
              ) : null}
            </Menu>
          </Box>

          <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />

          <Box
            sx={{
              flexGrow: 1,
              display: { xs: 'none', md: 'flex', justifyContent: 'center' },
            }}>
            {pages.map((page) => (
              <Button
                key={page}
                onClick={() => handleGoToPage(page)}
                sx={{ my: 2, color: 'white', display: 'block' }}>
                {page}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            {!location.state || !location.state.userLogged ? (
              <MenuItem>
                <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                  <Button
                    onClick={handleLogin}
                    sx={{ my: 2, color: 'white', display: 'block' }}>
                    Login
                  </Button>
                </Box>
              </MenuItem>
            ) : (
              <>
                <Tooltip
                  title="Ouvrir le menu"
                  sx={{ backgroundColor: 'secondary' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                      <Avatar sx={{ backgroundColor: 'success.main' }}>
                        {location.state.userLogged.user.first_name
                          .charAt(0)
                          .toUpperCase()}
                        {location.state.userLogged.user.last_name
                          .charAt(0)
                          .toUpperCase()}
                      </Avatar>
                    </IconButton>

                    <Typography sx={{ fontSize: '0.8rem', p: 1 }}>
                      {location.state.userLogged.user.email}
                    </Typography>
                  </Box>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClick={handleCloseUserMenu}
                  onClose={handleCloseUserMenu}>
                  {(location.pathname !== '/register' ||
                    location.pathname === '/view-users') &&
                  location.state.userLogged.user.role === 'admin' ? (
                    <div>
                      <MenuItem onClick={handleViewUsers}>
                        <Typography textAlign="center">Dashboard</Typography>
                      </MenuItem>
                      <MenuItem onClick={handleEditMissions}>
                        <Typography textAlign="center">Missions</Typography>
                      </MenuItem>
                      <MenuItem onClick={handleLogout}>
                        <Typography textAlign="center">Logout</Typography>
                      </MenuItem>
                    </div>
                  ) : location.pathname !== '/register' &&
                    location.state.userLogged.user.role === 'volunteer' ? (
                    <div>
                      <MenuItem onClick={handleProfile}>
                        <Typography textAlign="center">Profile</Typography>
                      </MenuItem>

                      <MenuItem onClick={handleLogout}>
                        <Typography textAlign="center">Logout</Typography>
                      </MenuItem>
                    </div>
                  ) : (
                    <MenuItem onClick={handleLogout}>
                      <Typography textAlign="center">Logout</Typography>
                    </MenuItem>
                  )}
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;
