import { useState, useEffect } from 'react';
import {
  fetchAuthenticatedUser,
  login,
  logout,
  register,
  lineRedirect,
} from '../api/auth';
import { useNavigate } from 'react-router-dom';

// ユーザーの型定義
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

// 認証情報を管理するカスタムフック
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

  // 認証ユーザーを取得して状態を更新する
  useEffect(() => {
    async function loadUser() {
      try {
        const authenticatedUser = await fetchAuthenticatedUser();
        setUser(authenticatedUser);
      } catch (error) {
        console.error('認証情報の取得に失敗しました', error);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  // ログイン関数
  async function handleLogin(email: string, password: string) {
    try {
      const loggedInUser = await login(email, password);
      setUser(loggedInUser);
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
    loading,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
    lineLogin: handleLineLogin,
    errors,
  };
}
