import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from 'contexts/AuthContext';
import Loader from 'components/ui/Loader';

const LineLoginSuccess = () => {
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated } = useAuthContext();

  useEffect(() => {
    // パスからユーザー情報を取得
    const params = new URLSearchParams(window.location.search);
    const loggedInUser = params.get('user');
    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser);

      setUser(parsedUser);
      setIsAuthenticated(true);
    }
    console.log('ラインログイン');

    navigate('/');
  }, [navigate, setIsAuthenticated, setUser]);

  return <Loader />;
};

export default LineLoginSuccess;
