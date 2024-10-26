import { useState, useEffect } from 'react';
import { fetchAuthenticatedUser, login, logout } from '../api/auth'; // 認証APIを呼び出す

// ユーザーの型定義
interface User {
  id: number;
  name: string;
  email: string;
}

// 認証情報を管理するカスタムフック
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      console.error('ログイン失敗', error);
    }
  }

  // ログアウト関数
  async function handleLogout() {
    try {
      await logout();
      setUser(null);
    } catch (error) {
      console.error('ログアウト失敗', error);
    }
  }

  return {
    user,
    loading,
    login: handleLogin,
    logout: handleLogout,
  };
}
