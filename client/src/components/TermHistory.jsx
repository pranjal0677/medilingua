// client/src/components/TermHistory.jsx
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
} from '@mui/material';
import { medicalService } from '../services/api';

const TermHistory = () => {
  const [tab, setTab] = useState(0);
  const [popularTerms, setPopularTerms] = useState([]);
  const [recentTerms, setRecentTerms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
    setLoading(true);
    setError('');
    try {
      const [popular, recent] = await Promise.all([
        medicalService.getPopularTerms(),
        medicalService.getRecentTerms()
      ]);
      setPopularTerms(popular);
      setRecentTerms(recent);
    } catch (error) {
      setError('Failed to load terms');
      console.error('Error loading terms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" m={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ mt: 3, p: 2 }}>
      <Tabs value={tab} onChange={handleTabChange} centered>
        <Tab label="Popular Terms" />
        <Tab label="Recent Searches" />
      </Tabs>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mt: 2 }}>
        {tab === 0 ? (
          <>
            <Typography variant="h6" gutterBottom>
              Most Searched Terms
            </Typography>
            <List>
              {popularTerms.map((term, index) => (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={term.term}
                    secondary={`Searched ${term.searchCount} times`}
                  />
                </ListItem>
              ))}
            </List>
          </>
        ) : (
          <>
            <Typography variant="h6" gutterBottom>
              Recent Searches
            </Typography>
            <List>
              {recentTerms.map((term, index) => (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={term.term}
                    secondary={new Date(term.createdAt).toLocaleDateString()}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Box>
    </Paper>
  );
};

export default TermHistory;