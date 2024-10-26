import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from 'components/Layout';
import Home from '../pages/Home';
import Login from '../pages/Login';
import NoMatch from '../pages/NoMatch';

const AppRoutes: React.FC = () => (
  <Routes>
    <Route element={<Layout />}>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NoMatch />} />
    </Route>
  </Routes>
);

export default AppRoutes;
