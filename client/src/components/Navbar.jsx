// client/src/components/Navbar.jsx
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  useTheme,
  useMediaQuery,
  IconButton,
  Menu,
  MenuItem,
  Fade,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person as PersonIcon,
  History as HistoryIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { medicalService } from '../services/api';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/clerk-react';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isSignedIn, user: clerkUser } = useUser();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    checkAuthStatus();
    console.log('Initial auth check');
  }, []);

  // Enhanced checkAuthStatus function
  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    console.log('Auth Status Check:', { token: !!token, userData: !!userData });

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('User data:', parsedUser);
        setIsLoggedIn(true);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        handleLogout(); // Clear invalid data
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  const menuItems = [
    { text: 'Term Simplifier', path: '/' },
    { text: 'Report Analyzer', path: '/report' },
    { text: 'Dictionary', path: '/dictionary' },
  ];

  const userMenuItems = [
    { text: 'Profile', path: '/profile', icon: <PersonIcon /> },
    { text: 'History', path: '/history', icon: <HistoryIcon /> },
  ];

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenu = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

   // Enhanced handleLogout function
   const handleLogout = async () => {
    try {
      await medicalService.logout();
      setIsLoggedIn(false);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      handleUserMenuClose();
      navigate('/login');
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Add debug logging for menu state
  useEffect(() => {
    console.log('Auth state changed:', { isLoggedIn, user });
  }, [isLoggedIn, user]);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: theme.palette.primary.main,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar>
          <Typography 
            variant="h6" 
            component={RouterLink} 
            to="/" 
            sx={{ 
              flexGrow: 1, 
              textDecoration: 'none', 
              color: 'inherit',
              fontWeight: 'bold',
              '&:hover': {
                opacity: 0.9
              }
            }}
          >
            MediLingua
          </Typography>
          
          {isMobile ? (
            <>
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleMenu}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                TransitionComponent={Fade}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    mt: 1.5,
                    minWidth: 180,
                    borderRadius: 1,
                  }
                }}
              >
                {menuItems.map((item) => (
                  <MenuItem
                    key={item.path}
                    component={RouterLink}
                    to={item.path}
                    onClick={handleClose}
                    selected={isActive(item.path)}
                    sx={{
                      py: 1,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.light + '20'
                      }
                    }}
                  >
                    {item.text}
                  </MenuItem>
                ))}

{process.env.NODE_ENV === 'development' && (
            <Box sx={{ position: 'absolute', top: '100%', right: 0, bgcolor: 'background.paper', p: 1, fontSize: '0.75rem' }}>
              {isLoggedIn ? `Logged in as: ${user?.name}` : 'Not logged in'}
            </Box>
          )}
                
                {isLoggedIn ? (
                  <>
                    <Divider sx={{ my: 1 }} />
                    {userMenuItems.map((item) => (
                      <MenuItem
                        key={item.path}
                        component={RouterLink}
                        to={item.path}
                        onClick={handleClose}
                        selected={isActive(item.path)}
                        sx={{
                          py: 1,
                          display: 'flex',
                          gap: 1,
                          '&:hover': {
                            backgroundColor: theme.palette.primary.light + '20'
                          }
                        }}
                      >
                        {item.icon}
                        {item.text}
                      </MenuItem>
                    ))}
                    <MenuItem
                      onClick={() => {
                        handleClose();
                        handleLogout();
                      }}
                      sx={{
                        color: 'error.main',
                        py: 1,
                        display: 'flex',
                        gap: 1
                      }}
                    >
                      <LogoutIcon />
                      Logout
                    </MenuItem>
                  </>
                ) : (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <MenuItem
                      component={RouterLink}
                      to="/login"
                      onClick={handleClose}
                    >
                      Login
                    </MenuItem>
                    <MenuItem
                      component={RouterLink}
                      to="/signup"
                      onClick={handleClose}
                    >
                      Sign Up
                    </MenuItem>
                  </>
                )}
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  component={RouterLink}
                  to={item.path}
                  sx={{ 
                    textTransform: 'none',
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    backgroundColor: isActive(item.path) ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)'
                    }
                  }}
                >
                  {item.text}
                </Button>
              ))}
              
              {isLoggedIn ? (
                <>
                  <IconButton
                    onClick={handleUserMenu}
                    sx={{ ml: 2 }}
                    color="inherit"
                  >
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        bgcolor: 'primary.dark',
                        border: '2px solid',
                        borderColor: 'primary.light'
                      }}
                    >
                      {user?.name?.[0]?.toUpperCase() || <PersonIcon />}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={userMenuAnchor}
                    open={Boolean(userMenuAnchor)}
                    onClose={handleUserMenuClose}
                    TransitionComponent={Fade}
                    PaperProps={{
                      elevation: 3,
                      sx: { mt: 1.5 }
                    }}
                  >
                    
                    
                    {userMenuItems.map((item) => (
                      <MenuItem
                        key={item.path}
                        component={RouterLink}
                        to={item.path}
                        onClick={handleUserMenuClose}
                        sx={{
                          display: 'flex',
                          gap: 1,
                          py: 1
                        }}
                      >
                        {item.icon}
                        {item.text}
                      </MenuItem>
                    ))}
                    <Divider />
                    <MenuItem
                      onClick={handleLogout}
                      sx={{
                        color: 'error.main',
                        display: 'flex',
                        gap: 1,
                        py: 1
                      }}
                    >
                      <LogoutIcon />
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                  <SignUpButton mode="modal">
                    <Button
                      color="inherit"
                      sx={{ 
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)'
                        }
                      }}
                    >
                      Sign Up
                    </Button>
                  </SignUpButton>
                  <SignInButton mode="modal">
                    <Button
                      color="inherit"
                      sx={{ 
                        border: '1px solid',
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        borderRadius: 1,
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          borderColor: 'rgba(255, 255, 255, 0.8)'
                        }
                      }}
                    >
                      Login
                    </Button>
                  </SignInButton>
                </Box>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Toolbar /> {/* Spacer */}
    </>
  );
};

// Add this somewhere in your Navbar component
{process.env.NODE_ENV === 'development' && (
  <Button
    color="inherit"
    onClick={() => {
      console.log('Auth State:', {
        token: localStorage.getItem('token'),
        user: localStorage.getItem('user'),
        isLoggedIn
      });
    }}
  >
    Debug Auth
  </Button>
)}


export default Navbar;