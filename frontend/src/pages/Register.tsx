import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Loader from 'components/ui/Loader';
import { TextField, Button, Box, Typography } from '@mui/material';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const { register, user, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(name, email, password, passwordConfirmation);
      console.log('新規会員登録成功');
    } catch (error) {
      console.error('新規会員登録失敗', error);
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
        新規会員登録
      </Typography>
      <TextField
        label="氏名"
        variant="outlined"
        fullWidth
        margin="normal"
        type="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
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
      <TextField
        label="パスワード確認"
        variant="outlined"
        fullWidth
        margin="normal"
        type="password"
        value={passwordConfirmation}
        onChange={(e) => setPasswordConfirmation(e.target.value)}
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
      {user && (
        <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
          ログイン中: {user.name}
        </Typography>
      )}
    </Box>
  );
};

export default Register;
