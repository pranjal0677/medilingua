// client/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { CssBaseline, Box } from '@mui/material'; // Add Box import here
import Navbar from './components/Navbar';
import TermSimplifier from './components/TermSimplifier';
import ReportAnalyzer from './components/ReportAnalyzer';
import MedicalDictionary from './components/MedicalDictionary';
import LoginForm from './components/auth/LoginForm';
import PageLayout from './components/layout/PageLayout';
import SignupForm from './components/auth/SignupForm';
import UserHistory from './components/user/UserHistory';
import UserProfile from './components/user/UserProfile';
import ProtectedRoute from './components/auth/ProtectedRoute'; // Add this import
import { AuthProvider } from './context/AuthContext';

import ErrorBoundary from './components/ErrorBoundary';

import { createTheme, ThemeProvider } from '@mui/material/styles';


const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3d83c1', // Medium Action Blue
      light: '#7dacd6',
      dark: '#295881',
    },
    secondary: {
      main: '#577399', // Glaucous
      light: '#768eb0',
      dark: '#34455b',
    },
    background: {
      default: '#495867', // Payne's Gray
      paper: '#2c363f',   // Darker Payne's Gray
    },
    text: {
      primary: '#f7f7ff', // Ghost White
      secondary: '#bdd5ea', // Columbia Blue
    },
    error: {
      main: '#577399', // Changed to Glaucous
    },
    warning: {
      main: '#7CB9E8', // Aero blue
    },
    info: {
      main: '#bdd5ea', // Columbia Blue
    },
    success: {
      main: '#7dacd6', // Light Action Blue
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
  },
});




// ... in your Routes


const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
      light: '#60a5fa',
      dark: '#1e40af',
    },
    secondary: {
      main: '#dc2626',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});

function App() {
  return (
    <AuthProvider>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box 
          sx={{ 
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            width: '100vw',
            overflow: 'hidden'
          }}
        >
          <Navbar />
          <PageLayout>
            <Routes>
              <Route path="/" element={<TermSimplifier />} />
              <Route path="/report" element={<ReportAnalyzer />} />
              <Route path="/dictionary" element={<MedicalDictionary />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/signup" element={<SignupForm />} />
              <Route path="/history" element={<UserHistory />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route 
  path="/report" 
  element={
    <ErrorBoundary>
      <ReportAnalyzer />
    </ErrorBoundary>
  } 
/>
              
              <Route 
                path="/profile" 
                  element={
                  <ProtectedRoute>
                  <UserProfile />
                  </ProtectedRoute>
                } 
              />
              <Route 
              path="/history" 
              element={
                <ProtectedRoute>
                  <UserHistory />
                </ProtectedRoute>
              } 
            />
              
            </Routes>
          </PageLayout>
        </Box>
      </Router>
    </ThemeProvider>
    </AuthProvider>
  );
}

export default App;