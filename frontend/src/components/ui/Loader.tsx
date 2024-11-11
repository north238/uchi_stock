import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const Loader: React.FC = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
    >
      <CircularProgress color="primary" />
      <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
        Loading...
      </Typography>
    </Box>
  );
};

export default Loader;
