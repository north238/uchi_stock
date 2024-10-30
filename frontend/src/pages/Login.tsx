import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import { api } from '../api/axios';
import Loader from 'components/ui/Loader';
import { TextField, Button, Box, Typography } from '@mui/material';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, user, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      console.log('ログイン成功');
    } catch (error) {
      console.error('ログイン失敗', error);
    }
  };

  // LINE認証処理関数
  const handleLineLogin = async () => {
    try {
      axios.defaults.withCredentials = true;
      await api.get('/sanctum/csrf-cookie');
      const response = await api.get('/auth/line/redirect');
      window.location.href = await response.data.url;
      console.log('LINEログイン成功');
    } catch (error) {
      console.error('LINEログインに失敗しました', error);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: 400, mx: 'auto', mt: 5 }}
    >
      <Typography variant="h5" component="h2" gutterBottom>
        ログイン
      </Typography>
      <TextField
        label="メールアドレス"
        variant="outlined"
        fullWidth
        margin="normal"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="パスワード"
        variant="outlined"
        fullWidth
        margin="normal"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
      >
        ログイン
      </Button>

      <Button
        variant="outlined"
        color="secondary"
        fullWidth
        sx={{ mt: 2 }}
        onClick={handleLineLogin}
      >
        LINEでログイン
      </Button>
      {user && (
        <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
          ログイン中: {user.name}
        </Typography>
      )}
    </Box>
  );
};

export default Login;
