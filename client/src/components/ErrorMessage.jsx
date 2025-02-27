// client/src/components/ErrorMessage.jsx
import { Alert, AlertTitle } from '@mui/material';

const ErrorMessage = ({ title = 'Error', message }) => {
  return (
    <Alert severity="error" sx={{ mt: 2 }}>
      <AlertTitle>{title}</AlertTitle>
      {message}
    </Alert>
  );
};

export default ErrorMessage;