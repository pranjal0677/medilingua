// client/src/components/MedicalDictionary.jsx
import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Typography,
  Box,
  Autocomplete,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { medicalService } from '../services/api';

const MedicalDictionary = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState(null);

  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
    try {
      const [popular, recent] = await Promise.all([
        medicalService.getPopularTerms(),
        medicalService.getRecentTerms()
      ]);
      const combinedTerms = [...popular, ...recent];
      const uniqueTerms = Array.from(new Set(combinedTerms.map(t => t.term)))
        .map(term => combinedTerms.find(t => t.term === term));
      setTerms(uniqueTerms);
    } catch (error) {
      console.error('Error loading terms:', error);
    }
  };

  const handleSearch = async (term) => {
    if (!term) return;
    setLoading(true);
    try {
      const result = await medicalService.simplifyTerm(term);
      setSelectedTerm(result);
    } catch (error) {
      console.error('Error searching term:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom color="primary">
              Medical Terms Dictionary
            </Typography>
            
            <Autocomplete
              freeSolo
              options={terms.map(t => t.term)}
              onInputChange={(_, value) => setSearchTerm(value)}
              onChange={(_, value) => handleSearch(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search medical terms"
                  variant="outlined"
                  fullWidth
                  sx={{ mb: 3 }}
                />
              )}
            />

            {loading && <CircularProgress />}

            {selectedTerm && (
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    {selectedTerm.term}
                  </Typography>
                  
                  <Typography variant="body1" paragraph>
                    {selectedTerm.explanation}
                  </Typography>

                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    Examples:
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {selectedTerm.examples.map((example, index) => (
                      <Chip
                        key={index}
                        label={example}
                        sx={{ mr: 1, mb: 1 }}
                        variant="outlined"
                      />
                    ))}
                  </Box>

                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    Related Terms:
                  </Typography>
                  <Box>
                    {selectedTerm.relatedTerms.map((term, index) => (
                      <Chip
                        key={index}
                        label={term}
                        onClick={() => handleSearch(term)}
                        sx={{ mr: 1, mb: 1 }}
                        color="primary"
                        variant="outlined"
                        clickable
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MedicalDictionary;