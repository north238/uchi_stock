import { LoginParams, RegisterParams, User } from 'types';
import { api, initializeCsrfToken } from '../api/axios';
import checkCookies from '../util/getCookie';

// 認証ユーザーの取得関数
async function fetchAuthenticatedUser(): Promise<User> {
  try {
    // CSRFトークンの初期化
    await initializeCsrfToken();

    // クッキー取得
    const cookies = checkCookies();
    const xsrfToken = decodeURIComponent(cookies['XSRF-TOKEN'] || '');

    // `XSRF-TOKEN`が取得できているか確認
    if (!xsrfToken) {
      throw new Error('XSRF-TOKENが見つかりません');
    }

    // 認証ユーザー情報の取得
    const response = await api.get<User>('/user', {
      headers: {
        'X-XSRF-TOKEN': xsrfToken,
      },
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    console.error('認証ユーザーの取得に失敗しました:', error);
    throw error;
  }
}

// ログイン関数の型定義
async function login(params: LoginParams): Promise<User> {
  try {
    await initializeCsrfToken();
    const response = await api.post<{ user: User }>('/login', params);

    return response.data.user;
  } catch (error) {
    console.error('ログイン失敗:', error);
    throw error;
  }
}

// ログアウト関数
async function logout(): Promise<void> {
  try {
    await initializeCsrfToken();
    await api.post('/logout');
  } catch (error) {
    console.error('ログアウトに失敗しました:', error);
    throw error;
  }
}

// 新規会員登録
async function register(params: RegisterParams): Promise<User> {
  try {
    await initializeCsrfToken();
    const response = await api.post<{ token: string; user: User }>(
      '/register',
      params
    );

    return response.data.user;
  } catch (error) {
    console.error('新規会員登録失敗:', error);
    throw error;
  }
}

// LINEログイン
async function lineRedirect() {
  try {
    const response = await api.get('/auth/line/redirect');
    // サーバーから返却されたURLをセット（LINEコールバック）
    window.location.href = await response.data.url;
  } catch (error) {
    console.error('LINEログイン失敗:', error);
    throw error;
  }
}

export { fetchAuthenticatedUser, login, logout, register, lineRedirect };
