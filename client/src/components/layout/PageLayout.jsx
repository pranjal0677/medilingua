// client/src/components/layout/PageLayout.jsx
import { Box, Container } from '@mui/material';
import ScrollToTop from '../ScrollToTop';

const PageLayout = ({ children }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f5f7fa',
        pt: '64px', // Height of the navbar
      }}
    >
      <Container 
        maxWidth={false} 
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          py: { xs: 2, sm: 3, md: 4 },
          px: { xs: 1, sm: 2, md: 3 },
          maxWidth: '100%',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: '1200px',
            mx: 'auto',
            flex: 1,
          }}
        >
          {children}
        </Box>
      </Container>
      <ScrollToTop />
    </Box>
  );
};

export default PageLayout;