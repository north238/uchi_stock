import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // ここにベースURLを指定
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export { api };
