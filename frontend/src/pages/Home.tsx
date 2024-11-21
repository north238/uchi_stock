import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import ItemList from 'components/ItemList';
import { useAuthContext } from 'contexts/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuthContext();

  return (
    <Card sx={{ p: '10px', mt: '10px' }}>
      <CardContent>
        <Typography variant="h5" component="div">
          アイテム一覧
        </Typography>
      </CardContent>
      {user && <ItemList />}
    </Card>
  );
};

export default Home;
