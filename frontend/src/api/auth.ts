import { api } from '../api/axios';
import axios from 'axios';

// ユーザーの型定義
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

// ログイン関数の型定義
async function login(email: string, password: string): Promise<User> {
  try {
    await axios.get('http://localhost:8080/api/sanctum/csrf-cookie', {
      withCredentials: true,
    });
    const response = await api.post<{ token: string; user: User }>('/login', {
      email,
      password,
    });
    const token = response.data.token;

    // トークンをlocalStorageに保存
    localStorage.setItem('auth_token', token);

    console.log('ログイン成功:', response.data.user);
    return response.data.user; // ユーザー情報を返す
  } catch (error: any) {
    console.error('ログイン失敗:', error.response?.data || error);
    throw error;
  }
}

// 認証ユーザーの取得関数
async function fetchAuthenticatedUser(): Promise<User> {
  try {
    const token = localStorage.getItem('auth_token');

    // トークンが存在する場合、認証ヘッダーを追加してユーザー情報を取得
    if (token) {
      const response = await api.get<User>('/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('認証ユーザー情報:', response.data);
      return response.data;
    } else {
      throw new Error('トークンが見つかりません');
    }
  } catch (error) {
    console.error('認証ユーザーの取得に失敗しました:', error);
    throw error;
  }
}

// ログアウト関数
async function logout(): Promise<void> {
  try {
    const token = localStorage.getItem('auth_token');

    if (token) {
      await api.post(
        '/logout',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // ログアウト後にトークンを削除
      localStorage.removeItem('auth_token');
      console.log('ログアウト成功');
    }
  } catch (error) {
    console.error('ログアウトに失敗しました:', error);
    throw error;
  }
}

// ログイン関数の型定義
async function register(
  name: string,
  email: string,
  password: string,
  password_confirmation: string
): Promise<User> {
  try {
    axios.defaults.withCredentials = true;
    await api.get('/sanctum/csrf-cookie');
    const response = await api.post<{ token: string; user: User }>(
      '/register',
      {
        name,
        email,
        password,
        password_confirmation,
      }
    );
    const token = response.data.token;

    // トークンをlocalStorageに保存
    localStorage.setItem('auth_token', token);

    console.log('新規会員登録成功:', response.data.user);
    return response.data.user; // ユーザー情報を返す
  } catch (error: any) {
    console.error('新規会員登録失敗:', error.response?.data || error);
    throw error;
  }
}

export { login, logout, fetchAuthenticatedUser, register };
