import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const Home: React.FC = () => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="div">
          Welcome to Home Page
        </Typography>
        <Typography variant="body2">
          This is the home page of the application.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default Home;
