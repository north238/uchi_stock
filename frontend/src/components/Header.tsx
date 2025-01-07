import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import ProfileMenu from './mui/ProfileMenu';
import SearchArea from './mui/SearchArea';
import { useAuthContext } from 'contexts/AuthContext';
import NotificationIcon from './mui/NotificationIcon';

const Header: React.FC = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  return (
    <AppBar position="fixed">
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          onClick={() => navigate('/')}
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            ml: '10px',
            cursor: 'pointer', // クリック可能であることを示すためにカーソルを変更
          }}
        >
          うちStock
        </Typography>
        <SearchArea />
        {user ? (
          <>
            <ProfileMenu />
            <NotificationIcon />
          </>
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
