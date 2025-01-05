import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from 'components/Layout';
import Home from '../pages/Home';
import NoMatch from '../pages/NoMatch';
import Login from '../pages/Login';
import Register from '../pages/Register';
import LineLoginSuccess from 'pages/LineLoginSuccess';
import Profile from '../pages/Profile';
import Notification from 'pages/Notification';

const AppRoutes: React.FC = () => (
  <Routes>
    <Route element={<Layout />}>
      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/notification" element={<Notification />} />
      <Route path="*" element={<NoMatch />} />
    </Route>

    <Route path="/line-login-success" element={<LineLoginSuccess />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
  </Routes>
);

export default AppRoutes;
