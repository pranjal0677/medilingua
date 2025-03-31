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
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person as PersonIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/clerk-react';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const { isSignedIn } = useUser();

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

  const handleClose = () => {
    setAnchorEl(null);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <AppBar position="fixed">
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
              >
                {menuItems.map((item) => (
                  <MenuItem
                    key={item.path}
                    component={RouterLink}
                    to={item.path}
                    onClick={handleClose}
                  >
                    {item.text}
                  </MenuItem>
                ))}

                {isSignedIn ? (
                  <>
                    <Divider sx={{ my: 1 }} />
                    {userMenuItems.map((item) => (
                      <MenuItem
                        key={item.path}
                        component={RouterLink}
                        to={item.path}
                        onClick={handleClose}
                      >
                        {item.icon}
                        {item.text}
                      </MenuItem>
                    ))}
                  </>
                ) : (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <SignInButton mode="modal">
                      <MenuItem onClick={handleClose}>
                        Login
                      </MenuItem>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <MenuItem onClick={handleClose}>
                        Sign Up
                      </MenuItem>
                    </SignUpButton>
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
              
              {isSignedIn ? (
                <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                  {userMenuItems.map((item) => (
                    <Button
                      key={item.path}
                      color="inherit"
                      component={RouterLink}
                      to={item.path}
                      startIcon={item.icon}
                      sx={{ 
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)'
                        }
                      }}
                    >
                      {item.text}
                    </Button>
                  ))}
                  <UserButton afterSignOutUrl="/" />
                </Box>
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

export default Navbar;