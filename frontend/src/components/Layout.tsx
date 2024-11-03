import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from './Header';

const Layout: React.FC = () => (
  <div>
    <Header />
    <Box component="main" sx={{ width: '80%', margin: '0 auto' }}>
      <Outlet />
    </Box>
  </div>
);

export default Layout;
