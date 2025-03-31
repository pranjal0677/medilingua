// client/src/components/user/UserHistory.jsx
import { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import {
  History as HistoryIcon,
  Search as SearchIcon,
  Description as DescriptionIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { medicalService } from '../../services/api';

const UserHistory = () => {
  const [tab, setTab] = useState(0);
  const [history, setHistory] = useState({
    terms: [],
    reports: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await medicalService.getUserHistory();
      setHistory(data);
    } catch (error) {
      setError('Failed to load history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedItem(null);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  const NoDataMessage = ({ type }) => (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      py={4}
      sx={{ color: 'text.secondary' }}
    >
      {type === 'term' ? <SearchIcon sx={{ fontSize: 48, mb: 2 }} /> : <DescriptionIcon sx={{ fontSize: 48, mb: 2 }} />}
      <Typography variant="h6">No {type === 'term' ? 'term searches' : 'report analyses'} yet</Typography>
      <Typography variant="body2">Your history will appear here</Typography>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 2, sm: 3 } }}>
      <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <HistoryIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
          <Typography variant="h5" color="primary">
            Your Medical History
          </Typography>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        <Tabs 
          value={tab} 
          onChange={handleTabChange} 
          sx={{ 
            mb: 3,
            borderBottom: 1,
            borderColor: 'divider',
          }}
          variant={isMobile ? "fullWidth" : "standard"}
        >
          <Tab 
            label="Term Searches" 
            icon={<SearchIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Report Analyses" 
            icon={<DescriptionIcon />} 
            iconPosition="start"
          />
        </Tabs>

        {tab === 0 && (
          <Box>
            {history.terms.length === 0 ? (
              <NoDataMessage type="term" />
            ) : (
              <List>
                {history.terms.map((item, index) => (
                  <Card key={index} sx={{ mb: 2 }}>
                    <CardContent>
                      <ListItem disablePadding>
                        <ListItemText
                          primary={item.original}
                          secondary={formatDate(item.timestamp)}
                          primaryTypographyProps={{
                            fontWeight: 500,
                            color: 'primary.main'
                          }}
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleViewDetails(item)}
                          sx={{ ml: 2 }}
                        >
                          View Details
                        </Button>
                      </ListItem>
                    </CardContent>
                  </Card>
                ))}
              </List>
            )}
          </Box>
        )}

        {tab === 1 && (
          <Box>
            {history.reports.length === 0 ? (
              <NoDataMessage type="report" />
            ) : (
              <List>
                {history.reports.map((item, index) => (
                  <Card key={index} sx={{ mb: 2 }}>
                    <CardContent>
                      <ListItem disablePadding>
                        <ListItemText
                          primary={`Report Analysis ${index + 1}`}
                          secondary={formatDate(item.timestamp)}
                          primaryTypographyProps={{
                            fontWeight: 500,
                            color: 'primary.main'
                          }}
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleViewDetails(item)}
                          sx={{ ml: 2 }}
                        >
                          View Details
                        </Button>
                      </ListItem>
                    </CardContent>
                  </Card>
                ))}
              </List>
            )}
          </Box>
        )}

        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">
                {selectedItem?.type === 'term' ? 'Term Details' : 'Report Analysis Details'}
              </Typography>
              <IconButton onClick={handleCloseDialog}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {selectedItem && (
              <Box>
                {selectedItem.type === 'term' ? (
                  <>
                    <Typography variant="subtitle1" color="primary" gutterBottom>
                      Original Term:
                    </Typography>
                    <Typography paragraph>{selectedItem.original}</Typography>
                    <Typography variant="subtitle1" color="primary" gutterBottom>
                      Simplified Explanation:
                    </Typography>
                    <Typography paragraph>{selectedItem.simplified?.explanation}</Typography>
                  </>
                ) : (
                  <>
                    <Box mb={3}>
                      <Typography variant="subtitle1" color="primary" gutterBottom>
                        Original Report:
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                        <Typography>{selectedItem.original}</Typography>
                      </Paper>
                    </Box>

                    <Box mb={3}>
                      <Typography variant="subtitle1" color="primary" gutterBottom>
                        Analysis Summary:
                      </Typography>
                      <Typography paragraph>
                        {typeof selectedItem.simplified === 'string' 
                          ? JSON.parse(selectedItem.simplified).summary 
                          : selectedItem.simplified?.summary}
                      </Typography>
                    </Box>

                    {(typeof selectedItem.simplified === 'string' 
                      ? JSON.parse(selectedItem.simplified).details 
                      : selectedItem.simplified?.details) && (
                      <Box mb={3}>
                        <Typography variant="subtitle1" color="primary" gutterBottom>
                          Detailed Analysis:
                        </Typography>
                        <Typography paragraph>
                          {typeof selectedItem.simplified === 'string' 
                            ? JSON.parse(selectedItem.simplified).details 
                            : selectedItem.simplified?.details}
                        </Typography>
                      </Box>
                    )}

                    {(typeof selectedItem.simplified === 'string' 
                      ? JSON.parse(selectedItem.simplified).keyFindings 
                      : selectedItem.simplified?.keyFindings) && (
                      <Box mb={3}>
                        <Typography variant="subtitle1" color="primary" gutterBottom>
                          Key Findings:
                        </Typography>
                        <Typography paragraph>
                          {typeof selectedItem.simplified === 'string' 
                            ? JSON.parse(selectedItem.simplified).keyFindings 
                            : selectedItem.simplified?.keyFindings}
                        </Typography>
                      </Box>
                    )}

                    {(typeof selectedItem.simplified === 'string' 
                      ? JSON.parse(selectedItem.simplified).actions 
                      : selectedItem.simplified?.actions)?.length > 0 && (
                      <Box mb={3}>
                        <Typography variant="subtitle1" color="primary" gutterBottom>
                          Recommended Actions:
                        </Typography>
                        <Box component="ul" sx={{ pl: 2 }}>
                          {(typeof selectedItem.simplified === 'string' 
                            ? JSON.parse(selectedItem.simplified).actions 
                            : selectedItem.simplified?.actions).map((action, index) => (
                            <Typography component="li" key={index} paragraph>
                              {action}
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                    )}

                    {(typeof selectedItem.simplified === 'string' 
                      ? JSON.parse(selectedItem.simplified).warnings 
                      : selectedItem.simplified?.warnings)?.length > 0 && (
                      <Box mb={3}>
                        <Typography variant="subtitle1" color="primary" gutterBottom>
                          Warnings:
                        </Typography>
                        {(typeof selectedItem.simplified === 'string' 
                          ? JSON.parse(selectedItem.simplified).warnings 
                          : selectedItem.simplified?.warnings).map((warning, index) => (
                          <Alert key={index} severity="warning" sx={{ mb: 1 }}>
                            {warning}
                          </Alert>
                        ))}
                      </Box>
                    )}
                  </>
                )}
                <Typography variant="caption" color="text.secondary">
                  {selectedItem.type === 'term' ? 'Searched' : 'Analyzed'} on: {formatDate(selectedItem.timestamp)}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Close</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default UserHistory;