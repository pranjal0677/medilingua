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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  Person as PersonIcon,
  History as HistoryIcon,
  ExitToApp as LogoutIcon,
  Search as SearchIcon,
  Description as DocumentIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { medicalService } from '../../services/api';

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [history, setHistory] = useState({
    terms: [],
    reports: []
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [detailsModal, setDetailsModal] = useState({
    open: false,
    type: null,
    data: null
  });

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
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const loadUserHistory = async () => {
    try {
      console.log('Fetching user history...');
      const historyData = await medicalService.getUserHistory();
      console.log('History data received:', historyData);

      // The data is already processed in the API service
      setHistory({
        terms: historyData.terms || [],
        reports: historyData.reports || []
      });

      console.log('History state updated:', {
        terms: historyData.terms?.length || 0,
        reports: historyData.reports?.length || 0
      });
    } catch (error) {
      console.error('History error:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load history',
        severity: 'error'
      });
    }
  };

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
                          {item.original || 'Unknown Term'}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            Searched on: {new Date(item.timestamp).toLocaleString()}
                          </Typography>
                          {item.simplified?.explanation && (
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
                              {item.simplified.explanation}
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
                {history.reports.map((item, index) => {
                  // Parse the simplified JSON string for reports
                  let analysis = item.simplified;
                  try {
                    if (typeof item.simplified === 'string') {
                      analysis = JSON.parse(item.simplified);
                    }
                  } catch (error) {
                    console.error('Error parsing report analysis:', error);
                  }

                  return (
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
                            {analysis?.summary && (
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
                                {analysis.summary}
                              </Typography>
                            )}
                          </>
                        }
                      />
                      <Button 
                        size="small"
                        variant="outlined"
                        onClick={() => handleViewReportDetails(item)}
                        sx={{ ml: 2 }}
                      >
                        View Details
                      </Button>
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Box>
        )}
      </Paper>

      {/* Details Modal */}
      <Dialog
        open={detailsModal.open}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {detailsModal.type === 'term' ? 'Term Details' : 'Report Analysis Details'}
            </Typography>
            <IconButton onClick={handleCloseDetails}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {detailsModal.data && (
            <Box>
              {detailsModal.type === 'term' ? (
                // Term Details View
                <Box>
                  <Box mb={3}>
                    <Typography variant="subtitle2" color="textSecondary">Term</Typography>
                    <Typography variant="h6">{detailsModal.data.original}</Typography>
                  </Box>

                  <Box mb={3}>
                    <Typography variant="subtitle2" color="textSecondary">Explanation</Typography>
                    <Typography paragraph sx={{ mt: 1 }}>
                      {detailsModal.data.simplified?.explanation}
                    </Typography>
                  </Box>

                  {detailsModal.data.simplified?.examples?.length > 0 && (
                    <Box mb={3}>
                      <Typography variant="subtitle2" color="textSecondary">Examples</Typography>
                      <Box sx={{ mt: 1 }}>
                        {detailsModal.data.simplified.examples.map((example, index) => (
                          <Typography key={index} paragraph sx={{ pl: 2 }}>
                            • {example}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  )}

                  {detailsModal.data.simplified?.relatedTerms?.length > 0 && (
                    <Box mb={3}>
                      <Typography variant="subtitle2" color="textSecondary">Related Terms</Typography>
                      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {detailsModal.data.simplified.relatedTerms.map((term, index) => (
                          <Chip key={index} label={term} variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {detailsModal.data.simplified?.notes && (
                    <Box mb={3}>
                      <Typography variant="subtitle2" color="textSecondary">Additional Notes</Typography>
                      <Alert severity="info" sx={{ mt: 1 }}>
                        {detailsModal.data.simplified.notes}
                      </Alert>
                    </Box>
                  )}
                </Box>
              ) : (
                // Report Analysis Details View
                <Box>
                  {(() => {
                    let analysis = detailsModal.data.simplified;
                    try {
                      if (typeof detailsModal.data.simplified === 'string') {
                        analysis = JSON.parse(detailsModal.data.simplified);
                      }
                    } catch (error) {
                      console.error('Error parsing report analysis:', error);
                    }

                    return (
                      <>
                        <Box mb={3}>
                          <Typography variant="subtitle2" color="textSecondary">Analysis Date</Typography>
                          <Typography variant="caption">
                            {new Date(detailsModal.data.timestamp).toLocaleString()}
                          </Typography>
                        </Box>

                        <Box mb={3}>
                          <Typography variant="subtitle2" color="textSecondary">Report Text</Typography>
                          <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'grey.50' }}>
                            <Typography>{detailsModal.data.original}</Typography>
                          </Paper>
                        </Box>

                        <Box mb={3}>
                          <Typography variant="subtitle2" color="textSecondary">Summary</Typography>
                          <Typography paragraph sx={{ mt: 1 }}>
                            {analysis?.summary}
                          </Typography>
                        </Box>

                        {analysis?.keyPoints?.length > 0 && (
                          <Box mb={3}>
                            <Typography variant="subtitle2" color="textSecondary">Key Points</Typography>
                            <Box sx={{ mt: 1 }}>
                              {analysis.keyPoints.map((point, index) => (
                                <Typography key={index} paragraph sx={{ pl: 2 }}>
                                  • {point}
                                </Typography>
                              ))}
                            </Box>
                          </Box>
                        )}

                        {analysis?.medicalTerms?.length > 0 && (
                          <Box mb={3}>
                            <Typography variant="subtitle2" color="textSecondary">Medical Terms</Typography>
                            <Box sx={{ mt: 1 }}>
                              {analysis.medicalTerms.map((term, index) => (
                                <Box key={index} sx={{ mb: 2 }}>
                                  <Typography variant="subtitle2">{term.term}</Typography>
                                  <Typography color="text.secondary">{term.explanation}</Typography>
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        )}

                        {analysis?.actions?.length > 0 && (
                          <Box mb={3}>
                            <Typography variant="subtitle2" color="textSecondary">Recommended Actions</Typography>
                            <Box sx={{ mt: 1 }}>
                              {analysis.actions.map((action, index) => (
                                <Typography key={index} paragraph sx={{ pl: 2 }}>
                                  • {action}
                                </Typography>
                              ))}
                            </Box>
                          </Box>
                        )}

                        {analysis?.warnings?.length > 0 && (
                          <Box mb={3}>
                            <Typography variant="subtitle2" color="textSecondary">Warnings</Typography>
                            <Box sx={{ mt: 1 }}>
                              {analysis.warnings.map((warning, index) => (
                                <Alert key={index} severity="warning" sx={{ mb: 1 }}>
                                  {warning}
                                </Alert>
                              ))}
                            </Box>
                          </Box>
                        )}
                      </>
                    );
                  })()}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
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