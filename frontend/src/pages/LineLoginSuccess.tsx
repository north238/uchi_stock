import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LineLoginSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('auth_token', token);
      navigate('/');
    } else {
      console.error('トークンが取得できませんでした');
    }
  }, [navigate]);

  return <div>ログイン処理中...</div>;
};

export default LineLoginSuccess;
