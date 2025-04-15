// client/src/components/user/UserHistory.jsx
import { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
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
  Chip,
  Divider,
  Grid,
} from '@mui/material';
import {
  History as HistoryIcon,
  Search as SearchIcon,
  Description as DescriptionIcon,
  Close as CloseIcon,
  TextFields as TermIcon,
  Assignment as ReportIcon,
} from '@mui/icons-material';
import { medicalService } from '../../services/api';

const UserHistory = () => {
  const [history, setHistory] = useState({
    terms: [],
    reports: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
      <Typography variant="body2">Your {type === 'term' ? 'term search' : 'report analysis'} history will appear here</Typography>
    </Box>
  );

  const HistoryColumn = ({ items, type, title, icon }) => (
    <Box sx={{ height: '100%' }}>
      <Box display="flex" alignItems="center" mb={2}>
        {icon}
        <Typography variant="h6" color={type === 'term' ? 'primary' : 'secondary'} sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Box>
      
      {items.length === 0 ? (
        <NoDataMessage type={type} />
      ) : (
        <List sx={{ maxHeight: '600px', overflow: 'auto' }}>
          {items.map((item, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <ListItem disablePadding>
                  <ListItemText
                    primary={
                      type === 'term' 
                        ? item.original
                        : (item.original.length > 50 
                            ? `${item.original.substring(0, 50)}...` 
                            : item.original)
                    }
                    secondary={formatDate(item.timestamp)}
                    primaryTypographyProps={{
                      fontWeight: 500,
                      color: type === 'term' ? 'primary.main' : 'secondary.main'
                    }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleViewDetails({ ...item, type })}
                    sx={{ ml: 2 }}
                    color={type === 'term' ? 'primary' : 'secondary'}
                  >
                    View
                  </Button>
                </ListItem>
              </CardContent>
            </Card>
          ))}
        </List>
      )}
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, sm: 3 } }}>
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

        {isMobile ? (
          // Mobile view - stacked columns
          <Box>
            <Box mb={4}>
              <HistoryColumn 
                items={history.terms} 
                type="term" 
                title="Term Search History" 
                icon={<TermIcon color="primary" />} 
              />
            </Box>
            <Divider sx={{ my: 3 }} />
            <Box>
              <HistoryColumn 
                items={history.reports} 
                type="report" 
                title="Report Analysis History" 
                icon={<ReportIcon color="secondary" />} 
              />
            </Box>
          </Box>
        ) : (
          // Desktop view - side by side columns
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <HistoryColumn 
                items={history.terms} 
                type="term" 
                title="Term Search History" 
                icon={<TermIcon color="primary" />} 
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ borderLeft: `1px solid ${theme.palette.divider}`, pl: 3, height: '100%' }}>
                <HistoryColumn 
                  items={history.reports} 
                  type="report" 
                  title="Report Analysis History" 
                  icon={<ReportIcon color="secondary" />} 
                />
              </Box>
            </Grid>
          </Grid>
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

                    {(() => {
                      let parsedData;
                      try {
                        parsedData = typeof selectedItem.simplified === 'string' 
                          ? JSON.parse(selectedItem.simplified)
                          : selectedItem.simplified;
                      } catch (e) {
                        console.error('Error parsing simplified report data:', e);
                        return (
                          <Alert severity="error" sx={{ mb: 2 }}>
                            Error displaying report data
                          </Alert>
                        );
                      }
                        
                      return (
                        <>
                          <Box mb={3}>
                            <Typography variant="subtitle1" color="primary" gutterBottom>
                              Analysis Summary:
                            </Typography>
                            <Typography paragraph>
                              {parsedData?.summary || 'No summary available'}
                            </Typography>
                          </Box>

                          {parsedData?.keyPoints && parsedData.keyPoints.length > 0 && (
                            <Box mb={3}>
                              <Typography variant="subtitle1" color="primary" gutterBottom>
                                Key Points:
                              </Typography>
                              <ul>
                                {parsedData.keyPoints.map((point, idx) => (
                                  <li key={idx}>
                                    <Typography>{point}</Typography>
                                  </li>
                                ))}
                              </ul>
                            </Box>
                          )}

                          {parsedData?.medicalTerms && parsedData.medicalTerms.length > 0 && (
                            <Box mb={3}>
                              <Typography variant="subtitle1" color="primary" gutterBottom>
                                Medical Terms:
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {parsedData.medicalTerms.map((term, idx) => (
                                  <Chip 
                                    key={idx} 
                                    label={term} 
                                    color="primary" 
                                    variant="outlined" 
                                    size="small"
                                  />
                                ))}
                              </Box>
                            </Box>
                          )}

                          {parsedData?.actions && parsedData.actions.length > 0 && (
                            <Box mb={3}>
                              <Typography variant="subtitle1" color="primary" gutterBottom>
                                Recommended Actions:
                              </Typography>
                              <ul>
                                {parsedData.actions.map((action, idx) => (
                                  <li key={idx}>
                                    <Typography>{action}</Typography>
                                  </li>
                                ))}
                              </ul>
                            </Box>
                          )}

                          {parsedData?.warnings && parsedData.warnings.length > 0 && (
                            <Box mb={3}>
                              <Typography variant="subtitle1" color="primary" gutterBottom>
                                Warnings:
                              </Typography>
                              {parsedData.warnings.map((warning, idx) => (
                                <Alert key={idx} severity="warning" sx={{ mb: 1 }}>
                                  {warning}
                                </Alert>
                              ))}
                            </Box>
                          )}
                        </>
                      );
                    })()}
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