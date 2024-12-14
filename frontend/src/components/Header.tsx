import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ProfileMenu from './mui/ProfileMenu';
import SearchArea from './mui/SearchArea';
import { useAuthContext } from 'contexts/AuthContext';

const Header: React.FC = () => {
  const { user } = useAuthContext();

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography
          variant="h6"
          component="a"
          href="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            ml: '10px',
          }}
        >
          うちStock
        </Typography>
        <SearchArea />
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
