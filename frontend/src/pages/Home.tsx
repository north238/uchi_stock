import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { fetchAuthenticatedUser } from 'api/auth';
import { useAuthContext } from 'contexts/AuthContext';
import { useLoading } from 'contexts/LoadingContext';
import AlertWithErrors from 'components/mui/AlertWithErrors';
import AlertWithSuccess from 'components/mui/AlertWithSuccess';
import ItemList from 'components/ItemList';
import Loader from 'components/ui/Loader';

const Home: React.FC = () => {
  const { user, setUser } = useAuthContext();
  const { loading, setLoading } = useLoading();
  const [errors, setErrors] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetchAuthenticatedUser();
        setUser(response);
      } catch (error) {
        console.error('認識ユーザー取得に失敗しました。', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    console.log('ユーザー認証');

    fetchUser();
  }, [setUser, setLoading, navigate]);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <AlertWithErrors errors={errors} setErrors={setErrors} />
      <AlertWithSuccess success={success} setSuccess={setSuccess} />
      <Card sx={{ p: '10px', mt: '10px' }}>
        <CardContent>
          <Typography variant="h5" component="div">
            アイテム一覧
          </Typography>
        </CardContent>
        {user && <ItemList setErrors={setErrors} setSuccess={setSuccess} />}
      </Card>
    </>
  );
};

export default Home;
