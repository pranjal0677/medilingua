// client/src/components/ReportAnalyzer.jsx
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
  Divider,
} from '@mui/material';
import { medicalService } from '../services/api';

const ReportAnalyzer = () => {
  const [reportText, setReportText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // client/src/components/ReportAnalyzer.jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!reportText.trim()) return;

  setLoading(true);
  setError('');
  try {
    // Get analysis from API
    const analysisResult = await medicalService.analyzeReport(reportText);
    console.log('Analysis result:', analysisResult);

    // Save to history with both original text and result
    await medicalService.addReportToHistory({
      reportText: reportText,
      result: analysisResult  // Make sure we're sending the complete result
    });
    
    setResult(analysisResult);
  } catch (error) {
    setError('Failed to analyze report. Please try again.');
    console.error('Error:', error);
  } finally {
    setLoading(false);
  }
};

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!reportText.trim()) return;
  
  //   setLoading(true);
  //   setError('');
  //   try {
  //     const data = await medicalService.analyzeReport(reportText);
      
  //     // Save to history
  //     await medicalService.addReportToHistory(reportText, data);
      
  //     setResult(data);
  //   } catch (error) {
  //     setError('Failed to analyze report. Please try again.');
  //     console.error('Error:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleClear = () => {
    setReportText('');
    setResult(null);
    setError('');
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant={isMobile ? "h6" : "h5"} gutterBottom color="primary">
          Medical Report Analyzer
        </Typography>

        {/* Input Section - Always Visible */}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={isMobile ? 4 : 6}
            label="Paste your medical report here"
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            margin="normal"
            variant="outlined"
            disabled={loading}
            error={!!error}
            helperText={error}
          />
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ minWidth: '120px' }}
            >
              {loading ? <CircularProgress size={24} /> : 'Analyze'}
            </Button>
            {reportText && (
              <Button
                variant="outlined"
                onClick={handleClear}
                disabled={loading}
              >
                Clear
              </Button>
            )}
          </Box>
        </form>

        {/* Results Section */}
        {result && (
          <>
            <Divider sx={{ my: 4 }} />
            <Box>
              <Typography variant="h6" color="primary" gutterBottom>
                Analysis Results:
              </Typography>

              <Typography variant="subtitle1" color="primary" sx={{ mt: 3 }}>
                Summary:
              </Typography>
              <Typography paragraph>{result.summary}</Typography>

              {result.keyPoints?.length > 0 && (
                <>
                  <Typography variant="subtitle1" color="primary" sx={{ mt: 2 }}>
                    Key Points:
                  </Typography>
                  <Box component="ul" sx={{ mt: 1, mb: 3 }}>
                    {result.keyPoints.map((point, index) => (
                      <li key={index}>
                        <Typography paragraph>{point}</Typography>
                      </li>
                    ))}
                  </Box>
                </>
              )}

              {result.medicalTerms?.length > 0 && (
                <>
                  <Typography variant="subtitle1" color="primary" sx={{ mt: 2 }}>
                    Medical Terms Explained:
                  </Typography>
                  <Box sx={{ mt: 1, mb: 3 }}>
                    {result.medicalTerms.map((term, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {term.term}:
                        </Typography>
                        <Typography>{term.explanation}</Typography>
                      </Box>
                    ))}
                  </Box>
                </>
              )}

              {result.actions?.length > 0 && (
                <>
                  <Typography variant="subtitle1" color="primary" sx={{ mt: 2 }}>
                    Recommended Actions:
                  </Typography>
                  <Box component="ul" sx={{ mt: 1, mb: 3 }}>
                    {result.actions.map((action, index) => (
                      <li key={index}>
                        <Typography paragraph>{action}</Typography>
                      </li>
                    ))}
                  </Box>
                </>
              )}

              {result.warnings?.length > 0 && (
                <>
                  <Typography variant="subtitle1" color="primary" sx={{ mt: 2 }}>
                    Important Warnings:
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {result.warnings.map((warning, index) => (
                      <Alert severity="warning" sx={{ mt: 1 }} key={index}>
                        {warning}
                      </Alert>
                    ))}
                  </Box>
                </>
              )}
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default ReportAnalyzer;