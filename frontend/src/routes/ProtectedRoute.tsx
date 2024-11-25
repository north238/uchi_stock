import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from 'contexts/AuthContext';

const ProtectedRoute: React.FC = () => {
  const { user } = useAuthContext();

  // ユーザーが認証されていない場合はログインページへリダイレクト
  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
