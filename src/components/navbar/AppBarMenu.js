import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { styled, useTheme } from '@mui/material/styles';

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
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderIcon from '@mui/icons-material/Folder';
import GroupIcon from '@mui/icons-material/Group';
import PeopleIcon from '@mui/icons-material/People';
import InsightsIcon from '@mui/icons-material/Insights';
import SchoolIcon from '@mui/icons-material/School';
import HandshakeIcon from '@mui/icons-material/Handshake';
import LogoutIcon from '@mui/icons-material/Logout';

import SvgIcon from '@mui/material/SvgIcon';
// import Link from '@mui/material/Link';

import logo from '../../assets/mycogniverse3.gif';
import { isStaff, isManager } from '../../js/roles';

const pages = ['Accueil', 'Comment ça marche', 'Missions bénévoles'];
// const settings = ['Profil', 'Account', 'Dashboard', 'Logout'];

const BASE_URL = process.env.REACT_APP_BASE_URL;

const savedSession = () => {
  try {
    const token = localStorage.getItem('token');
    const session = JSON.parse(localStorage.getItem('user'));
    if (!token || !session?.user) return null;
    const { exp } = JSON.parse(atob(token.split('.')[1]));
    return exp * 1000 > Date.now() ? session : null;
  } catch {
    return null;
  }
};

function ResponsiveAppBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  // Pages don't always pass the session along: fall back to the one saved
  // at login, as long as its token has not expired
  const userLogged = location.state?.userLogged || savedSession() || '';
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
    } catch (err) {
      console.log(err);
    } finally {
      [
        'token',
        'token1',
        'users',
        'user',
        'user-status',
        'refreshToken',
      ].forEach((key) => localStorage.removeItem(key));
      navigate('/');
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
      } else if (page === 'Missions bénévoles') {
        // One missions page for everyone; admins get the tools on it
        navigate('/missions', { state: { userLogged } });
      } else if (
        page === 'Tableau de bord' &&
        (!userLogged || userLogged.user.role === 'volunteer')
      ) {
        navigate(`/stepper`, { state: { userLogged } });
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
    if (isStaff(userLogged.user.role)) {
      navigate(`/view-users`, { state: { userLogged } });
    }
  };

  // Highlight the menu entry of the section currently displayed
  const sectionPaths = {
    dashboard: ['/view-users', '/change-status', '/stepper', '/profile'],
    documents: ['/documents'],
    team: ['/equipe'],
    analysis: ['/analyse'],
    students: ['/eleves'],
    pairs: ['/binomes'],
  };
  const isCurrent = (section) =>
    sectionPaths[section].some((p) => location.pathname.startsWith(p));
  const currentProps = (section) =>
    isCurrent(section) ? { selected: true, 'aria-current': 'page' } : {};

  const handleTeam = () => {
    navigate(`/equipe`, { state: { userLogged } });
  };

  const handlePairs = () => {
    navigate(`/binomes`, { state: { userLogged } });
  };

  const handleStudents = () => {
    navigate(`/eleves`, { state: { userLogged } });
  };

  const handleAnalysis = () => {
    navigate(`/analyse`, { state: { userLogged } });
  };

  const handleAdminFiles = () => {
    navigate(`/documents`, { state: { userLogged } });
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
  //             {!userLogged ? (
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
  //                   {userLogged.user.first_name
  //                     .charAt(0)
  //                     .toUpperCase()}
  //                   {userLogged.user.last_name
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
  //               userLogged.user.role === 'admin' ? (
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
  //                 userLogged.user &&
  //                 userLogged.user.role === 'volunteer' ? (
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
    <AppBar fixed="top" color="primary">
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
              {!userLogged ? (
                <MenuItem onClick={() => navigate('/register', { state: 1 })}>
                  <Typography textAlign="center">Créer un compte</Typography>
                </MenuItem>
              ) : null}
              {!userLogged ? (
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
            {userLogged && userLogged.user.role === 'volunteer' && (
              <Button
                onClick={() => navigate('/stepper', { state: { userLogged } })}
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
            {!userLogged ? (
              <MenuItem>
                <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                  <Button
                    onClick={() => navigate('/register', { state: '1' })}
                    sx={{
                      my: 2,
                      backgroundColor: 'white',
                      color: 'primary',
                      '&:hover': {
                        backgroundColor: '',
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
                <Tooltip title={userLogged.user.email} describeChild>
                  <Button
                    onClick={handleOpenUserMenu}
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    aria-expanded={Boolean(anchorElUser)}
                    endIcon={
                      <KeyboardArrowDownIcon
                        sx={{
                          transition: 'transform 0.2s',
                          transform: anchorElUser ? 'rotate(180deg)' : 'none',
                        }}
                      />
                    }
                    sx={{
                      color: 'white',
                      textTransform: 'none',
                      borderRadius: 5,
                      pl: 0.5,
                      pr: 1.5,
                      border: '1px solid rgba(255, 255, 255, 0.5)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        borderColor: 'white',
                      },
                    }}>
                    <Avatar
                      sx={{
                        backgroundColor: 'success.main',
                        width: 32,
                        height: 32,
                        fontSize: '0.9rem',
                        mr: 1,
                      }}>
                      {userLogged.user.first_name.charAt(0).toUpperCase()}
                      {userLogged.user.last_name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography
                      sx={{
                        fontSize: '0.9rem',
                        display: { xs: 'none', sm: 'block' },
                      }}>
                      {userLogged.user.first_name}
                    </Typography>
                  </Button>
                </Tooltip>
                <Menu
                  sx={{
                    mt: '45px',
                    '& .MuiMenuItem-root': {
                      borderLeft: '4px solid transparent',
                    },
                    '& .MuiMenuItem-root.Mui-selected': {
                      borderLeftColor: 'primary.main',
                      fontWeight: 600,
                      color: 'primary.main',
                      '& .MuiListItemIcon-root': { color: 'primary.main' },
                    },
                  }}
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
                  isStaff(userLogged.user.role) ? (
                    <div>
                      <MenuItem
                        onClick={handleViewUsers}
                        {...currentProps('dashboard')}>
                        <ListItemIcon>
                          <PeopleIcon fontSize="small" />
                        </ListItemIcon>
                        Tuteurs bénévoles
                      </MenuItem>
                      {isManager(userLogged.user.role) && (
                        <MenuItem
                          onClick={handleStudents}
                          {...currentProps('students')}>
                          <ListItemIcon>
                            <SchoolIcon fontSize="small" />
                          </ListItemIcon>
                          Élèves
                        </MenuItem>
                      )}
                      {isManager(userLogged.user.role) && (
                        <MenuItem
                          onClick={handlePairs}
                          {...currentProps('pairs')}>
                          <ListItemIcon>
                            <HandshakeIcon fontSize="small" />
                          </ListItemIcon>
                          Binômes
                        </MenuItem>
                      )}
                      <MenuItem
                        onClick={handleAdminFiles}
                        {...currentProps('documents')}>
                        <ListItemIcon>
                          <FolderIcon fontSize="small" />
                        </ListItemIcon>
                        Documents
                      </MenuItem>
                      {isManager(userLogged.user.role) && (
                        <MenuItem
                          onClick={handleAnalysis}
                          {...currentProps('analysis')}>
                          <ListItemIcon>
                            <InsightsIcon fontSize="small" />
                          </ListItemIcon>
                          Analyse
                        </MenuItem>
                      )}
                      {isManager(userLogged.user.role) && (
                        <MenuItem
                          onClick={handleTeam}
                          {...currentProps('team')}>
                          <ListItemIcon>
                            <GroupIcon fontSize="small" />
                          </ListItemIcon>
                          Équipe
                        </MenuItem>
                      )}
                      <Divider />
                      <MenuItem onClick={handleLogout}>
                        <ListItemIcon>
                          <LogoutIcon fontSize="small" />
                        </ListItemIcon>
                        Déconnexion
                      </MenuItem>
                    </div>
                  ) : location.pathname !== '/register' &&
                    userLogged.user.role === 'volunteer' ? (
                    <div>
                      <MenuItem
                        onClick={handleProfile}
                        {...currentProps('dashboard')}>
                        <ListItemIcon>
                          <DashboardIcon fontSize="small" />
                        </ListItemIcon>
                        Tableau de bord
                      </MenuItem>
                      <Divider />
                      <MenuItem onClick={handleLogout}>
                        <ListItemIcon>
                          <LogoutIcon fontSize="small" />
                        </ListItemIcon>
                        Déconnexion
                      </MenuItem>
                    </div>
                  ) : (
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                      </ListItemIcon>
                      Déconnexion
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
