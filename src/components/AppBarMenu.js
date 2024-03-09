import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import SvgIcon from '@mui/material/SvgIcon';
// import Link from '@mui/material/Link';
import { replaceInvalidDateByNull } from '@mui/x-date-pickers/internals';

import CastForEducationIcon from '@mui/icons-material/CastForEducation';
import logo from '../assets/mycogniverse3.gif';
import logoIcon from '../assets/logo_icon.png';

const pages = ['Accueil', 'Comment ça marche', 'Missions bénévoles'];
const settings = ['Profil', 'Account', 'Dashboard', 'Logout'];

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
  // console.log('=======>', userLogged);

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
      if (page === 'Comment ça marche') {
        navigate('/faq', { state: { userLogged } });
      } else if (page === 'Accueil') {
        navigate('/', { state: { userLogged } });
      } else if (
        page === 'Missions bénévoles' &&
        (!userLogged || userLogged.user.role === 'volunteer')
      ) {
        navigate('/missions', { state: { userLogged } });
      } else if (
        page === 'Tableau de bord' &&
        (!userLogged || userLogged.user.role === 'volunteer')
      ) {
        navigate(`/stepper`, { state: { userLogged } });
      } else if (
        page === 'Missions bénévoles' &&
        userLogged.user.role === 'admin'
      ) {
        navigate('/all-missions', { state: { userLogged } });
      } else if (page === 'A propos') {
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
    if (
      userLogged.user.role === 'admin' ||
      userLogged.user.role === 'interviewer'
    ) {
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
              mr: 1,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
              cursor: 'pointer',
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
                <MenuItem key={page} onClick={() => handleGoToPage(page)}>
                  <Typography textAlign="center">{page}</Typography>
                </MenuItem>
              ))}
              {!location.state || !location.state.userLogged ? (
                <MenuItem onClick={handleLogin}>
                  <Typography textAlign="center">Se connecter</Typography>
                </MenuItem>
              ) : null}
            </Menu>
          </Box>
          <SvgIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }}>
            {/* <?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 20010904//EN"
 "http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd"> */}
            <svg
              version="1.0"
              xmlns="http://www.w3.org/2000/svg"
              width="32.000000pt"
              height="32.000000pt"
              viewBox="0 0 32.000000 32.000000"
              preserveAspectRatio="xMidYMid meet">
              <g
                transform="translate(0.000000,32.000000) scale(0.100000,-0.100000)"
                fill="#000000"
                stroke="none">
                <path
                  d="M11 306 c-8 -9 -11 -46 -9 -103 l3 -88 39 68 c21 38 42 65 46 60 4
-4 2 -37 -5 -73 -8 -35 -13 -66 -11 -68 3 -3 46 63 82 126 38 67 45 23 15 -98
-12 -48 -19 -64 -20 -45 0 17 4 50 10 74 5 24 8 45 6 48 -2 2 -21 -26 -42 -62
-51 -87 -80 -87 -64 0 4 22 6 41 5 43 -2 1 -17 -24 -35 -57 -33 -62 -39 -99
-19 -119 17 -17 279 -17 296 0 14 14 17 174 3 182 -5 3 -7 15 -4 26 7 27 -9
25 -34 -2 -31 -35 -43 -63 -43 -102 0 -39 14 -45 52 -25 16 9 19 8 16 -3 -3
-8 -20 -13 -44 -13 -38 0 -39 1 -42 37 -5 63 64 164 98 143 14 -9 13 38 -2 53
-18 18 -282 17 -297 -2z"
                />
              </g>
            </svg>
          </SvgIcon>

          {/* <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} /> */}

          <Box
            sx={{
              flexGrow: 1,
              display: { xs: 'none', md: 'flex', justifyContent: 'center' },
            }}>
            {/* {pages.map(
              (page) =>
                (userLogged.user.role === 'volunteer' ||
                  page !== 'Tableau de bord') && (
                  <Button
                    key={page}
                    onClick={() => handleGoToPage(page)}
                    sx={{
                      my: 2,
                      pl: 2,
                      pr: 2,
                      color: 'white',
                      display: 'block',
                    }}>
                    {page}
                  </Button>
                )
            )} */}
            <Button
              onClick={() => navigate('/faq', { state: { userLogged } })}
              sx={{
                my: 2,
                pl: 2,
                pr: 2,
                color: 'white',
                display: 'block',
              }}>
              Comment ça marche
            </Button>
            <Button
              onClick={() => navigate('/missions', { state: { userLogged } })}
              sx={{
                my: 2,
                pl: 2,
                pr: 2,
                color: 'white',
                display: 'block',
              }}>
              Missions bénévoles
            </Button>
            {location.state &&
              location.state.userLogged &&
              location.state.userLogged.user.role === 'volunteer' && (
                <Button
                  onClick={() =>
                    navigate('/stepper', { state: { userLogged } })
                  }
                  sx={{
                    my: 2,
                    pl: 2,
                    pr: 2,
                    color: 'white',
                    display: 'block',
                  }}>
                  Tableau de bord
                </Button>
              )}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            {!location.state || !location.state.userLogged ? (
              <MenuItem>
                <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                  <Button
                    onClick={() => navigate('/register', { state: '1' })}
                    sx={{
                      my: 2,
                      backgroundColor: 'white',
                      color: 'primary',
                      '&:hover': {
                        backgroundColor: 'success.main',
                        color: 'white',
                      },
                      display: 'block',
                    }}>
                    Créer un compte
                  </Button>
                  <Button
                    onClick={handleLogin}
                    sx={{
                      my: 2,
                      color: 'white',
                      display: 'block',
                    }}>
                    Se connecter
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
                  (location.state.userLogged.user.role === 'admin' ||
                    location.state.userLogged.user.role === 'interviewer') ? (
                    <div>
                      <MenuItem onClick={handleViewUsers}>
                        <Typography textAlign="center">
                          Tableau de bord
                        </Typography>
                      </MenuItem>

                      <MenuItem
                        onClick={handleEditMissions}
                        sx={{
                          display:
                            userLogged.user.role === 'interviewer' && 'none',
                        }}>
                        <Typography textAlign="center">Missions</Typography>
                      </MenuItem>
                      <MenuItem onClick={handleLogout}>
                        <Typography textAlign="center">Déconnexion</Typography>
                      </MenuItem>
                    </div>
                  ) : location.pathname !== '/register' &&
                    location.state.userLogged.user.role === 'volunteer' ? (
                    <div>
                      <MenuItem onClick={handleProfile}>
                        <Typography textAlign="center">
                          Tableau de bord
                        </Typography>
                      </MenuItem>

                      <MenuItem onClick={handleLogout}>
                        <Typography textAlign="center">Déconnexion</Typography>
                      </MenuItem>
                    </div>
                  ) : (
                    <MenuItem onClick={handleLogout}>
                      <Typography textAlign="center">Déconnexion</Typography>
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
