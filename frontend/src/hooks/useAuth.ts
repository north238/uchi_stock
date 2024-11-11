import { useState } from 'react';
import { login, logout, register, lineRedirect } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from 'contexts/AuthContext';

// 認証情報を管理するカスタムフック
export function useAuth() {
  const { user, setUser, isAuthenticated, setIsAuthenticated } =
    useAuthContext();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

  // ログイン関数
  async function handleLogin(email: string, password: string) {
    try {
      const loggedInUser = await login(email, password);

      setUser(loggedInUser);
      setIsAuthenticated(true);
      navigate('/');
    } catch (error) {
      console.error('ログイン失敗', error);
    }
  }

  // ログアウト関数
  async function handleLogout() {
    try {
      await logout();
      setUser(null);
      setIsAuthenticated(false);
      navigate('/login');
    } catch (error) {
      console.error('ログアウト失敗', error);
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
      navigate('/');
    } catch (error: any) {
      // サーバーから返されたエラーメッセージを設定
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: '登録処理でエラーが発生しました。' });
      }
    }
  }

  // LINE認証処理関数
  async function handleLineLogin() {
    try {
      await lineRedirect();
    } catch (error: any) {
      // サーバーから返されたエラーメッセージを設定
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: '登録処理でエラーが発生しました。' });
      }
    }
  }

  return {
    user,
    errors,
    isAuthenticated,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
    lineLogin: handleLineLogin,
  };
}
