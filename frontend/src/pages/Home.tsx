import React, { useEffect } from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import ItemList from 'components/ItemList';
import { useAuthContext } from 'contexts/AuthContext';
import { fetchAuthenticatedUser } from 'api/auth';

const Home: React.FC = () => {
  const { user, setUser } = useAuthContext();
  // 認証ユーザーを取得して状態を更新する
  useEffect(() => {
    async function updateUser() {
      try {
        const fetchedUser = await fetchAuthenticatedUser();
        setUser(fetchedUser);
      } catch (error) {
        console.error('ユーザー情報の取得に失敗しました:', error);
      }
    }
    updateUser();
  }, [setUser]);

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
