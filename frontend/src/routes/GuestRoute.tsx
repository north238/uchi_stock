import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from 'contexts/AuthContext';

const GuestRoute: React.FC = () => {
  const { user } = useAuthContext();

  // ユーザーが認証されている場合はリダイレクト
  return user ? <Navigate to="/" /> : <Outlet />;
};

export default GuestRoute;
