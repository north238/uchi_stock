import axios, { AxiosInstance } from 'axios';

const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
  withXSRFToken: true, // csrfトークンを生成する
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

let isCSRFInitialized = false;

// CSRFトークン取得
const initializeCsrfToken = async () => {
  if (isCSRFInitialized) return;

  try {
    await api.get('/sanctum/csrf-cookie');
    isCSRFInitialized = true;
  } catch (error) {
    console.error('CSRFトークンの初期化に失敗しました', error);
    throw error;
  }
};

export { api, initializeCsrfToken };
