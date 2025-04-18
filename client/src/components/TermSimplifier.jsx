// client/src/components/TermSimplifier.jsx
import { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { medicalService } from '../services/api';
import { useAuth } from '@clerk/clerk-react';

const TermSimplifier = () => {
  const [term, setTerm] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { isSignedIn } = useAuth();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!term.trim()) {
      setError('Please enter a medical term');
      return;
    }

    if (!isSignedIn) {
      setError('Please sign in to use this feature');
      return;
    }

    setLoading(true);
    setError('');
    try {
      console.log('Submitting term:', term);
      const data = await medicalService.simplifyTerm(term);
      console.log('Received result:', data);
      
      if (isSignedIn) {
        try {
          await medicalService.addTermToHistory(term, data);
        } catch (historyError) {
          console.warn('Could not save to history, but term was simplified:', historyError);
          // Don't fail the whole operation if history save fails
        }
      }
      
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to simplify term. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper 
        sx={{ 
          p: { xs: 2, sm: 3, md: 4 },
          width: '100%',
          maxWidth: '100%',
          overflow: 'hidden'
        }}
      >
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          gutterBottom 
          color="primary"
          sx={{ mb: 2 }}
        >
          Medical Term Simplifier
        </Typography>
        
        {!isSignedIn && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Please sign in to use this feature
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Enter medical term (e.g., hypertension)"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            margin="normal"
            variant="outlined"
            disabled={loading || !isSignedIn}
            error={!!error}
            helperText={error}
            sx={{ 
              maxWidth: '100%',
              '& .MuiInputBase-root': {
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }
            }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !isSignedIn}
            sx={{ 
              mt: 2,
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Simplify'}
          </Button>
        </form>

        {result && (
          <Box 
            sx={{ 
              mt: 4,
              width: '100%',
              overflow: 'hidden'
            }}
          >
            <Typography 
              variant={isMobile ? "subtitle1" : "h6"} 
              color="primary"
              gutterBottom
            >
              Explanation:
            </Typography>
            <Typography 
              paragraph
              sx={{
                fontSize: { xs: '0.9rem', sm: '1rem' },
                wordBreak: 'break-word'
              }}
            >
              {result.explanation}
            </Typography>

            {result.examples?.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography 
                  variant={isMobile ? "subtitle1" : "h6"} 
                  color="primary"
                  gutterBottom
                >
                  Examples:
                </Typography>
                <Box 
                  component="ul" 
                  sx={{ 
                    pl: 3,
                    '& li': {
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      mb: 1
                    }
                  }}
                >
                  {result.examples.map((example, index) => (
                    <li key={index}>{example}</li>
                  ))}
                </Box>
              </Box>
            )}

            {result.relatedTerms?.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography 
                  variant={isMobile ? "subtitle1" : "h6"} 
                  color="primary"
                  gutterBottom
                >
                  Related Terms:
                </Typography>
                <Box 
                  component="ul" 
                  sx={{ 
                    pl: 3,
                    '& li': {
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      mb: 1
                    }
                  }}
                >
                  {result.relatedTerms.map((term, index) => (
                    <li key={index}>{term}</li>
                  ))}
                </Box>
              </Box>
            )}

            {result.notes && (
              <Box sx={{ mt: 2 }}>
                <Typography 
                  variant={isMobile ? "subtitle1" : "h6"} 
                  color="primary"
                  gutterBottom
                >
                  Important Notes:
                </Typography>
                <Typography 
                  sx={{
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    color: 'error.main'
                  }}
                >
                  {result.notes}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default TermSimplifier;