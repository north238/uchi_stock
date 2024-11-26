import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ProfileMenu from './mui/ProfileMenu';
import { useAuthContext } from 'contexts/AuthContext';

const Header: React.FC = () => {
  const { user } = useAuthContext();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          うちStock
        </Typography>
        <Button color="inherit" component={RouterLink} to="/">
          ホーム
        </Button>
        <Button color="inherit" component={RouterLink} to="/item/create">
          登録
        </Button>
        {user ? (
          <ProfileMenu />
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
