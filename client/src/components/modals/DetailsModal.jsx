// src/components/modals/DetailsModal.jsx
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Divider,
    IconButton,
    Chip,
    Paper
  } from '@mui/material';
  import { Close as CloseIcon } from '@mui/icons-material';
  
  const DetailsModal = ({ open, onClose, type, data }) => {
    if (!data) return null;
  
    const formatDate = (timestamp) => {
      return new Date(timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
  
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {type === 'term' ? 'Term Details' : 'Report Analysis Details'}
            </Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        
        <DialogContent>
          {type === 'term' ? (
            // Term Details View
            <Box>
              <Box mb={3}>
                <Typography variant="subtitle2" color="textSecondary">Term</Typography>
                <Typography variant="h5" color="primary">{data.data?.term}</Typography>
                <Typography variant="caption" color="textSecondary">
                  Searched on {formatDate(data.timestamp)}
                </Typography>
              </Box>
  
              <Box mb={3}>
                <Typography variant="subtitle2" color="textSecondary">Explanation</Typography>
                <Typography>{data.data?.explanation}</Typography>
              </Box>
  
              {data.data?.examples?.length > 0 && (
                <Box mb={3}>
                  <Typography variant="subtitle2" color="textSecondary">Examples</Typography>
                  {data.data.examples.map((example, index) => (
                    <Typography key={index} paragraph>• {example}</Typography>
                  ))}
                </Box>
              )}
  
              {data.data?.relatedTerms?.length > 0 && (
                <Box mb={3}>
                  <Typography variant="subtitle2" color="textSecondary">Related Terms</Typography>
                  <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                    {data.data.relatedTerms.map((term, index) => (
                      <Chip key={index} label={term} variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}
  
              {data.data?.notes && (
                <Box mb={3}>
                  <Typography variant="subtitle2" color="textSecondary">Notes</Typography>
                  <Typography>{data.data.notes}</Typography>
                </Box>
              )}
            </Box>
          ) : (
            // Report Details View
            // Report Details View
<Box>
  <Box mb={3}>
    <Typography variant="subtitle2" color="textSecondary">Analysis Date</Typography>
    <Typography>{formatDate(data.timestamp)}</Typography>
  </Box>

  <Typography variant="h6" gutterBottom>
    Original Report
  </Typography>
  <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
    <Typography>{data.data?.originalText}</Typography>
  </Paper>

  <Typography variant="h6" gutterBottom>
    Analysis
  </Typography>
  
  <Box mb={3}>
    <Typography variant="subtitle2" color="textSecondary">
      Summary
    </Typography>
    <Typography>
      {data.data?.analysis?.summary}
    </Typography>
  </Box>

  {data.data?.analysis?.keyPoints?.length > 0 && (
    <Box mb={3}>
      <Typography variant="subtitle2" color="textSecondary">
        Key Points
      </Typography>
      {data.data.analysis.keyPoints.map((point, index) => (
        <Typography key={index} paragraph>• {point}</Typography>
      ))}
    </Box>
  )}

  {/* Keep your existing sections for medical terms, actions, and warnings */}
  {data.data?.medicalTerms?.length > 0 && (
    <Box mb={3}>
      <Typography variant="subtitle2" color="textSecondary">Medical Terms</Typography>
      {data.data.medicalTerms.map((term, index) => (
        <Box key={index} mb={2}>
          <Typography variant="subtitle2" color="primary">{term.term}</Typography>
          <Typography>{term.explanation}</Typography>
        </Box>
      ))}
    </Box>
  )}

  {data.data?.actions?.length > 0 && (
    <Box mb={3}>
      <Typography variant="subtitle2" color="textSecondary">Recommended Actions</Typography>
      {data.data.actions.map((action, index) => (
        <Typography key={index} paragraph>• {action}</Typography>
      ))}
    </Box>
  )}

  {data.data?.warnings?.length > 0 && (
    <Box mb={3}>
      <Typography variant="subtitle2" color="textSecondary">Warnings</Typography>
      {data.data.warnings.map((warning, index) => (
        <Chip 
          key={index} 
          label={warning} 
          color="error" 
          variant="outlined" 
          sx={{ m: 0.5 }} 
        />
      ))}
    </Box>
  )}
</Box>
          )}
        </DialogContent>
        
        
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
    
  };
  
  export default DetailsModal;