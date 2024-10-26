import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const Layout: React.FC = () => (
  <div>
    <Header />
    <main>
      <Outlet />
    </main>
  </div>
);

export default Layout;
