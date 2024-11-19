import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

interface User {
  id: number;
  name: string;
  email: string;
}

interface HeaderProps {
  user: User | null;
}

const Header: React.FC<HeaderProps> = (user) => {
  const { logout } = useAuth();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          うちStock
        </Typography>
        <Button color="inherit" component={RouterLink} to="/">
          ホーム
        </Button>
        <Button color="inherit" component={RouterLink} to="/item-create">
          登録
        </Button>
        {user ? (
          <Button color="inherit" onClick={logout}>
            ログアウト
          </Button>
        ) : (
          <>
            <Button color="inherit" component={RouterLink} to="/login">
              ログイン
            </Button>
            <Button color="inherit" component={RouterLink} to="/register">
              新規登録
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
