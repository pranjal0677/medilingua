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
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { medicalService } from '../../services/api';
import { useUser } from '@clerk/clerk-react';

const UserProfile = () => {
  const navigate = useNavigate();
  const { user: clerkUser, isSignedIn } = useUser();
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
    if (!isSignedIn) {
      navigate('/');
      return;
    }
    loadInitialData();
  }, [isSignedIn]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await loadUserHistory();
    } catch (error) {
      console.error('Error loading initial data:', error);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const loadUserHistory = async () => {
    try {
      console.log('Fetching user history...');
      const historyData = await medicalService.getUserHistory();
      console.log('History data received:', historyData);

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
              {clerkUser?.firstName?.[0]?.toUpperCase() || <PersonIcon fontSize="large" />}
            </Avatar>
            <Box>
              <Typography variant="h5">{clerkUser?.firstName} {clerkUser?.lastName}</Typography>
              <Typography color="textSecondary">{clerkUser?.primaryEmailAddress?.emailAddress}</Typography>
              <Typography variant="caption" color="textSecondary">
                Member since: {formatDate(clerkUser?.createdAt)}
              </Typography>
            </Box>
          </Box>
          <Box>
            <IconButton onClick={handleRefresh} sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
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
            label={`Recent Terms (${Math.min(history.terms.length, 3)})`}
            iconPosition="start"
          />
          <Tab 
            icon={<DocumentIcon />} 
            label={`Recent Reports (${Math.min(history.reports.length, 3)})`}
            iconPosition="start"
          />
        </Tabs>

        {activeTab === 0 && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Recent Term Searches</Typography>
              {history.terms.length > 3 && (
                <Button
                  component={RouterLink}
                  to="/history"
                  endIcon={<HistoryIcon />}
                  color="primary"
                >
                  View Full History
                </Button>
              )}
            </Box>
            {history.terms.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <SearchIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                <Typography color="textSecondary">
                  No term searches yet. Try searching for a medical term!
                </Typography>
              </Box>
            ) : (
              <List>
                {history.terms.slice(0, 3).map((term, index) => (
                  <ListItem
                    key={index}
                    divider={index !== Math.min(history.terms.length, 3) - 1}
                    sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                  >
                    <ListItemText
                      primary={term.original}
                      secondary={formatDate(term.timestamp)}
                    />
                    <Button
                      size="small"
                      onClick={() => handleViewTermDetails(term)}
                      sx={{ mt: 1 }}
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
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Recent Report Analyses</Typography>
              {history.reports.length > 3 && (
                <Button
                  component={RouterLink}
                  to="/history"
                  endIcon={<HistoryIcon />}
                  color="primary"
                >
                  View Full History
                </Button>
              )}
            </Box>
            {history.reports.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <DocumentIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                <Typography color="textSecondary">
                  No report analyses yet. Try analyzing a medical report!
                </Typography>
              </Box>
            ) : (
              <List>
                {history.reports.slice(0, 3).map((report, index) => (
                  <ListItem
                    key={index}
                    divider={index !== Math.min(history.reports.length, 3) - 1}
                    sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                  >
                    <ListItemText
                      primary={`Report Analysis ${index + 1}`}
                      secondary={formatDate(report.timestamp)}
                    />
                    <Button
                      size="small"
                      onClick={() => handleViewReportDetails(report)}
                      sx={{ mt: 1 }}
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

      {detailsModal.open && (
        <Dialog
          open={detailsModal.open}
          onClose={handleCloseDetails}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {detailsModal.type === 'term' ? 'Term Details' : 'Report Analysis'}
          </DialogTitle>
          <DialogContent>
            {detailsModal.type === 'term' ? (
              <>
                <Typography variant="h6" gutterBottom>Original Term</Typography>
                <Typography paragraph>{detailsModal.data.original}</Typography>
                <Typography variant="h6" gutterBottom>Simplified Explanation</Typography>
                <Typography paragraph>
                  {typeof detailsModal.data.simplified === 'string' 
                    ? detailsModal.data.simplified 
                    : detailsModal.data.simplified?.explanation}
                </Typography>
                {detailsModal.data.simplified?.examples && (
                  <>
                    <Typography variant="h6" gutterBottom>Examples</Typography>
                    <List>
                      {detailsModal.data.simplified.examples.map((example, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={example} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
                {detailsModal.data.simplified?.relatedTerms && (
                  <>
                    <Typography variant="h6" gutterBottom>Related Terms</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {detailsModal.data.simplified.relatedTerms.map((term, index) => (
                        <Chip key={index} label={term} variant="outlined" />
                      ))}
                    </Box>
                  </>
                )}
                {detailsModal.data.simplified?.notes && (
                  <>
                    <Typography variant="h6" gutterBottom>Additional Notes</Typography>
                    <Alert severity="info">{detailsModal.data.simplified.notes}</Alert>
                  </>
                )}
              </>
            ) : (
              <>
                <Typography variant="h6" gutterBottom>Original Report</Typography>
                <Typography paragraph>{detailsModal.data.original}</Typography>
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
                      {analysis?.summary && (
                        <>
                          <Typography variant="h6" gutterBottom>Analysis Summary</Typography>
                          <Typography paragraph>{analysis.summary}</Typography>
                        </>
                      )}
                      {analysis?.details && (
                        <>
                          <Typography variant="h6" gutterBottom>Detailed Analysis</Typography>
                          <Typography paragraph>{analysis.details}</Typography>
                        </>
                      )}
                      {analysis?.keyFindings && (
                        <>
                          <Typography variant="h6" gutterBottom>Key Findings</Typography>
                          <Typography paragraph>{analysis.keyFindings}</Typography>
                        </>
                      )}
                      {analysis?.actions && (
                        <>
                          <Typography variant="h6" gutterBottom>Recommended Actions</Typography>
                          <Typography paragraph>{analysis.actions}</Typography>
                        </>
                      )}
                      {analysis?.warnings && (
                        <>
                          <Typography variant="h6" gutterBottom>Warnings</Typography>
                          <Alert severity="warning">{analysis.warnings}</Alert>
                        </>
                      )}
                    </>
                  );
                })()}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDetails}>Close</Button>
          </DialogActions>
        </Dialog>
      )}

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