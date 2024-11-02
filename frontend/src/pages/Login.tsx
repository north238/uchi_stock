import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Loader from 'components/ui/Loader';
import { TextField, Button, Box, Typography } from '@mui/material';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, lineLogin, errors, user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  return (
    <Box
      component="form"
      onSubmit={() => login(email, password)}
      sx={{ maxWidth: 400, mx: 'auto', mt: 5 }}
    >
      <Typography variant="h5" component="h2" gutterBottom>
        ログイン
      </Typography>

      {errors.general && (
        <Typography variant="body2" color="error" sx={{ mt: 2 }}>
          {errors.general}
        </Typography>
      )}
      <TextField
        label="メールアドレス"
        variant="outlined"
        fullWidth
        margin="normal"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={!!errors.password}
        helperText={errors.password}
      />
      <TextField
        label="パスワード"
        variant="outlined"
        fullWidth
        margin="normal"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={!!errors.password}
        helperText={errors.password}
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
        onClick={lineLogin}
      >
        LINEログイン
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
