import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/index.css';
import App from './App';
import reportWebVitals from './util/reportWebVitals';
import SocketComponent from 'components/SocketComponent';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <SocketComponent />
    <App />
  </React.StrictMode>
);

reportWebVitals();
