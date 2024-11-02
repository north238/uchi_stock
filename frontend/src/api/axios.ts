import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// CSRFトークン取得
const initializeCsrfToken = async () => {
  try {
    await api.get('/sanctum/csrf-cookie');
  } catch (error) {
    console.error('CSRFトークンの初期化に失敗しました', error);
  }
};

export { api, initializeCsrfToken };
