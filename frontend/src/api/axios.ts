import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// CSRFトークン取得
const initializeCsrfToken = async () => {
  try {
    const res = await api.get('/sanctum/csrf-cookie');
    console.log('CSRFトークンの初期化に成功しました', res);
  } catch (error) {
    console.error('CSRFトークンの初期化に失敗しました', error);
  }
};

export { api, initializeCsrfToken };
