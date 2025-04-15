import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Paper,
  useTheme,
  useMediaQuery,
  Container
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HistoryIcon from '@mui/icons-material/History';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useAuth } from '@clerk/clerk-react';

const FeatureCard = ({ title, description, icon, buttonText, path, requiresAuth, isSignedIn }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
        },
        position: 'relative'
      }}
    >
      {requiresAuth && !isSignedIn && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            right: 0, 
            backgroundColor: 'warning.main', 
            color: 'warning.contrastText',
            px: 1,
            py: 0.5,
            borderBottomLeftRadius: 8,
            fontSize: '0.75rem',
            fontWeight: 'bold'
          }}
        >
          Sign in required
        </Box>
      )}
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Box sx={{ mr: 2, color: 'primary.main' }}>
          {icon}
        </Box>
        <Typography variant="h6" component="h2">
          {title}
        </Typography>
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="body1">
          {description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button 
          size="medium" 
          color="primary" 
          onClick={() => navigate(path)}
        >
          {buttonText}
        </Button>
      </CardActions>
    </Card>
  );
};

const HomePage = () => {
  const { isSignedIn } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2, sm: 4 }, 
          mb: 6, 
          backgroundColor: 'primary.light', 
          color: 'white',
          borderRadius: 2
        }}
      >
        <Typography 
          variant={isMobile ? "h4" : "h3"} 
          component="h1" 
          sx={{ fontWeight: 'bold', mb: 2 }}
        >
          Welcome to MediLingua
        </Typography>
        <Typography variant={isMobile ? "body1" : "h6"}>
          Your personal medical translator that simplifies complex healthcare terminology and medical reports.
          Experience healthcare information in language you can understand.
        </Typography>
      </Paper>
      
      <Grid container spacing={4}>
        <Grid item xs={12} sm={6} md={3}>
          <FeatureCard 
            title="Term Simplifier" 
            description="Translate complex medical terms into easy-to-understand language."
            icon={<MedicalInformationIcon fontSize="large" />}
            buttonText="Simplify Terms"
            path="/term"
            requiresAuth={false}
            isSignedIn={isSignedIn}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <FeatureCard 
            title="Report Analyzer" 
            description="Upload medical reports and get simplified explanations with key insights."
            icon={<AssignmentIcon fontSize="large" />}
            buttonText="Analyze Reports"
            path="/report"
            requiresAuth={true}
            isSignedIn={isSignedIn}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <FeatureCard 
            title="Medical Dictionary" 
            description="Browse a comprehensive dictionary of simplified medical terminology."
            icon={<MenuBookIcon fontSize="large" />}
            buttonText="Open Dictionary"
            path="/dictionary"
            requiresAuth={false}
            isSignedIn={isSignedIn}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <FeatureCard 
            title="Your History" 
            description="Access your previously simplified terms and analyzed reports."
            icon={<HistoryIcon fontSize="large" />}
            buttonText="View History"
            path="/history"
            requiresAuth={true}
            isSignedIn={isSignedIn}
          />
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h5" component="h2" gutterBottom color="primary">
          How MediLingua Helps You
        </Typography>
        <Typography variant="body1" paragraph>
          Medical jargon can be confusing and intimidating. MediLingua bridges the gap between complex
          medical terminology and everyday language, making healthcare information accessible to everyone.
        </Typography>
        <Typography variant="body1">
          Whether you're trying to understand a diagnosis, medication instructions, or a medical report,
          our AI-powered tools are here to help you make informed decisions about your health.
        </Typography>
      </Box>
    </Container>
  );
};

export default HomePage; 