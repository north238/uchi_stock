import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import ItemList from 'components/ItemList';
import { useAuth } from 'hooks/useAuth';

const Home: React.FC = () => {
  const { user } = useAuth();

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
      {user && <ItemList />}
    </Card>
  );
};

export default Home;
