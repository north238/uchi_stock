import { useState } from 'react';
import { login, logout, register, lineRedirect } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from 'contexts/AuthContext';
import { useLoading } from 'contexts/LoadingContext';

// 認証情報を管理するカスタムフック
// TODO: errorの型を正確に指定する
export function useAuth() {
  const { user, setUser, isAuthenticated, setIsAuthenticated } =
    useAuthContext();
  const [errors, setErrors] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setLoading } = useLoading();

  // ログイン関数
  async function handleLogin(email: string, password: string) {
    try {
      const loggedInUser = await login(email, password);

      setUser(loggedInUser);
      setIsAuthenticated(true);
      setLoading(false);
      navigate('/');
    } catch (error: any) {
      setLoading(false);
      if (error.response?.data?.message) {
        setErrors(error.response.data.message);
      } else {
        setErrors('ログインでエラーが発生しました。');
      }
    }
  }

  // ログアウト関数
  async function handleLogout() {
    try {
      await logout();
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      navigate('/login');
    } catch (error: any) {
      setLoading(false);
      if (error.response?.data?.message) {
        setErrors(error.response.data.message);
      } else {
        setErrors('登録処理でエラーが発生しました。');
      }
    }
  }

  // ユーザー新規登録
  async function handleRegister(
    name: string,
    email: string,
    password: string,
    password_confirmation: string
  ) {
    try {
      const loggedInUser = await register(
        name,
        email,
        password,
        password_confirmation
      );
      setUser(loggedInUser);
      setIsAuthenticated(true);
      setLoading(false);
      navigate('/');
    } catch (error: any) {
      setLoading(false);
      if (error.response?.data?.message) {
        setErrors(error.response.data.message);
      } else {
        setErrors('登録処理でエラーが発生しました。');
      }
    }
  }

  // LINE認証処理関数
  async function handleLineLogin() {
    try {
      await lineRedirect();
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      if (error.response?.data?.message) {
        setErrors(error.response.data.message);
      } else {
        setErrors('登録処理でエラーが発生しました。');
      }
    }
  }

  return {
    user,
    errors,
    setErrors,
    isAuthenticated,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
    lineLogin: handleLineLogin,
  };
}
