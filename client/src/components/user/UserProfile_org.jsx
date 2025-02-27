// client/src/components/user/UserProfile.jsx
import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  IconButton,
  Snackbar,
} from '@mui/material';
import {
  Person as PersonIcon,
  History as HistoryIcon,
  ExitToApp as LogoutIcon,
  Search as SearchIcon,
  Description as DocumentIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { medicalService } from '../../services/api';
import DetailsModal from '../modals/DetailsModal'; // Adjust the path as needed

// Add this state with your other states
const [detailsModal, setDetailsModal] = useState({
  open: false,
  type: null,
  data: null
});

// Add these handler functions
const handleViewTermDetails = (item) => {
  console.log('Opening term details:', item);
  setDetailsModal({
    open: true,
    type: 'term',
    data: item
  });
};

const handleViewReportDetails = (item) => {
  console.log('Opening report details:', item);
  setDetailsModal({
    open: true,
    type: 'report',
    data: item
  });
};

const handleCloseDetails = () => {
  setDetailsModal({
    open: false,
    type: null,
    data: null
  });
};



const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [history, setHistory] = useState({
    terms: [],
    reports: []
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const navigate = useNavigate();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadUserProfile(), loadUserHistory()]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReportDetails = (report) => {
    console.log('Viewing report details:', report);
    // You can implement a modal or navigation here
  };

  const loadUserProfile = async () => {
    try {
      const userData = await medicalService.getProfile();
      if (!userData) {
        throw new Error('No user data received');
      }
      setUser(userData);
      setError('');
    } catch (error) {
      setError('Failed to load profile');
      console.error('Profile error:', error);
      // Redirect to login if unauthorized
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  

  const handleLogout = async () => {
    try {
      await medicalService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setSnackbar({
        open: true,
        message: 'Failed to logout',
        severity: 'error'
      });
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleRefresh = () => {
    loadInitialData();
    setSnackbar({
      open: true,
      message: 'Refreshing data...',
      severity: 'info'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const loadUserHistory = async () => {
    try {
      console.log('Fetching user history...'); // Debug log
      const historyData = await medicalService.getUserHistory();
      console.log('History data received:', historyData); // Debug log

      // Filter and sort history items
      const terms = historyData?.filter(item => item.type === 'term') || [];
      const reports = historyData?.filter(item => item.type === 'report') || [];

      console.log('Processed history:', { terms, reports }); // Debug log
      
      setHistory({ terms, reports });
    } catch (error) {
      console.error('History error:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load history',
        severity: 'error'
      });
    }
  };

  // Add this function to handle term details view
  const handleViewTermDetails = (term) => {
    console.log('Viewing term details:', term);
    // You can implement a modal or navigation here
  };


  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar 
              sx={{ 
                width: 60, 
                height: 60, 
                bgcolor: 'primary.main',
                border: '2px solid',
                borderColor: 'primary.light'
              }}
            >
              {user?.name?.[0]?.toUpperCase() || <PersonIcon fontSize="large" />}
            </Avatar>
            <Box>
              <Typography variant="h5">{user?.name}</Typography>
              <Typography color="textSecondary">{user?.email}</Typography>
              {user?.createdAt && (
                <Typography variant="caption" color="textSecondary">
                  Member since: {formatDate(user.createdAt)}
                </Typography>
              )}
            </Box>
          </Box>
          <Box>
            <IconButton onClick={handleRefresh} sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </Paper>

      <DetailsModal
      open={detailsModal.open}
      onClose={handleCloseDetails}
      type={detailsModal.type}
      data={detailsModal.data}
    />

      <Paper sx={{ p: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
        >
          <Tab 
            icon={<SearchIcon />} 
            label={`Term Searches (${history.terms.length})`}
            iconPosition="start"
          />
          <Tab 
            icon={<DocumentIcon />} 
            label={`Report Analyses (${history.reports.length})`}
            iconPosition="start"
          />
        </Tabs>

        {activeTab === 0 && (
  <Box>
    <Typography variant="h6" gutterBottom>
      Recent Term Searches
    </Typography>
    {history.terms.length === 0 ? (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <SearchIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
        <Typography color="textSecondary">
          No term searches yet. Try searching for a medical term!
        </Typography>
      </Box>
    ) : (
      <List>
        {history.terms.map((item, index) => (
          <ListItem 
            key={index}
            divider={index !== history.terms.length - 1}
            sx={{
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <ListItemText
              primary={
                <Typography variant="subtitle1" color="primary">
                  {item.data?.term || 'Unknown Term'}
                </Typography>
              }
              secondary={
                <>
                  <Typography variant="body2" color="text.secondary">
                    Searched on: {new Date(item.timestamp).toLocaleString()}
                  </Typography>
                  {item.data?.explanation && (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        mt: 1,
                        color: 'text.primary',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {item.data.explanation}
                    </Typography>
                  )}
                </>
              }
            />
            <Button 
              size="small" 
              variant="outlined"
              onClick={() => handleViewTermDetails(item)}
              sx={{ ml: 2 }}
            >
              View Details
            </Button>
          </ListItem>
        ))}
      </List>
    )}
  </Box>
)}

{activeTab === 1 && (
  <Box>
    <Typography variant="h6" gutterBottom>
      Report Analysis History
    </Typography>
    {history.reports.length === 0 ? (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <DocumentIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
        <Typography color="textSecondary">
          No report analyses yet. Try analyzing a medical report!
        </Typography>
      </Box>
    ) : (
      <List>
        {history.reports.map((item, index) => (
          <ListItem 
            key={index}
            divider={index !== history.reports.length - 1}
            sx={{
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <ListItemText
              primary={
                <Typography variant="subtitle1" color="primary">
                  Report Analysis #{index + 1}
                </Typography>
              }
              secondary={
                <>
                  <Typography variant="body2" color="text.secondary">
                    Analyzed on: {new Date(item.timestamp).toLocaleString()}
                  </Typography>
                  {item.data?.summary && (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        mt: 1,
                        color: 'text.primary',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {item.data.summary}
                    </Typography>
                  )}
                </>
              }
            />
            <Button 
              size="small" 
              variant="outlined"
              onClick={() => handleViewTermDetails(item)}
              sx={{ ml: 2 }}
            >
              View Details
            </Button>
          </ListItem>
        ))}
      </List>
    )}
  </Box>
)}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserProfile;